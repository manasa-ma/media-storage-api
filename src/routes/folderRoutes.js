const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

router.get('/', authenticate, async (req, res) => {
  const { parentId } = req.query;
  let q = supabase.from('folders').select('*').eq('owner_id', req.user.id).eq('is_deleted', false);
  parentId && parentId !== 'null' ? q = q.eq('parent_id', parentId) : q = q.is('parent_id', null);
  const { data } = await q;
  res.json(data || []);
});

router.post('/', authenticate, async (req, res) => {
  const { name, parentId } = req.body;
  const { data } = await supabase.from('folders').insert([{ name, owner_id: req.user.id, parent_id: parentId || null }]).select();
  res.status(201).json(data[0]);
});

router.patch('/:id', authenticate, async (req, res) => {
  const { name } = req.body;
  const { data } = await supabase.from('folders').update({ name }).eq('id', req.params.id).eq('owner_id', req.user.id).select();
  res.json(data[0]);
});

router.delete('/:id', authenticate, async (req, res) => {
  await supabase.from('folders').update({ is_deleted: true, deleted_at: new Date() }).eq('id', req.params.id).eq('owner_id', req.user.id);
  res.json({ message: 'Moved to trash' });
});

module.exports = router;