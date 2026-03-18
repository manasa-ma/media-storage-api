const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

router.get('/', authenticate, async (req, res) => {
  const folders = await supabase.from('folders').select('*').eq('owner_id', req.user.id).eq('is_deleted', true);
  const files = await supabase.from('files').select('*').eq('owner_id', req.user.id).eq('is_deleted', true);
  res.json({ folders: folders.data || [], files: files.data || [] });
});

router.post('/restore', authenticate, async (req, res) => {
  const { id, type } = req.body;
  await supabase.from(type).update({ is_deleted: false, deleted_at: null }).eq('id', id);
  res.json({ message: 'Restored' });
});

router.delete('/permanent/:id', authenticate, async (req, res) => {
  const { type } = req.query;
  if (type === 'files') {
    const { data: f } = await supabase.from('files').select('storage_path').eq('id', req.params.id).single();
    if (f) await supabase.storage.from('media').remove([f.storage_path]);
  }
  await supabase.from(type).delete().eq('id', req.params.id);
  res.json({ message: 'Deleted forever' });
});

module.exports = router;