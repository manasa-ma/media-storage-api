const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

router.get('/', authenticate, async (req, res) => {
  const { folderId } = req.query;
  let q = supabase.from('files').select('*').eq('owner_id', req.user.id).eq('is_deleted', false);
  folderId && folderId !== 'null' ? q = q.eq('folder_id', folderId) : q = q.is('folder_id', null);
  const { data } = await q;
  res.json(data || []);
});

router.post('/', authenticate, async (req, res) => {
  const { name, storagePath, size, mimeType, folderId } = req.body;
  const { data } = await supabase.from('files').insert([{ 
    name, storage_path: storagePath, size_bytes: size, mime_type: mimeType, owner_id: req.user.id, folder_id: folderId || null 
  }]).select();
  res.status(201).json(data[0]);
});

router.patch('/:id', authenticate, async (req, res) => {
  const { name } = req.body;
  const { data } = await supabase.from('files').update({ name }).eq('id', req.params.id).eq('owner_id', req.user.id).select();
  res.json(data[0]);
});

router.delete('/:id', authenticate, async (req, res) => {
  await supabase.from('files').update({ is_deleted: true, deleted_at: new Date() }).eq('id', req.params.id).eq('owner_id', req.user.id);
  res.json({ message: 'Moved to trash' });
});

module.exports = router;