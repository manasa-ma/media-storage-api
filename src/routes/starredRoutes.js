const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// GET: All starred items
router.get('/', authenticate, async (req, res) => {
  const folders = await supabase.from('folders').select('*').eq('owner_id', req.user.id).eq('is_starred', true).eq('is_deleted', false);
  const files = await supabase.from('files').select('*').eq('owner_id', req.user.id).eq('is_starred', true).eq('is_deleted', false);
  res.json({ folders: folders.data || [], files: files.data || [] });
});

// GET: Recent files (last 10 uploaded)
router.get('/recent', authenticate, async (req, res) => {
  const { data } = await supabase.from('files')
    .select('*')
    .eq('owner_id', req.user.id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(10);
  res.json(data || []);
});

// POST: Toggle star status
router.post('/toggle', authenticate, async (req, res) => {
  const { id, type, isStarred } = req.body;
  await supabase.from(type).update({ is_starred: !isStarred }).eq('id', id);
  res.json({ message: 'Updated' });
});

module.exports = router;