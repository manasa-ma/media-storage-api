const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// SHARE a file with an email
router.post('/', authenticate, async (req, res) => {
  const { fileId, email, permission } = req.body;
  const { data, error } = await supabase.from('shares').insert([{ 
    file_id: fileId, shared_with_email: email, permission 
  }]).select();
  if (error) return res.status(400).json(error);
  res.status(201).json(data[0]);
});

// GET files shared WITH me
router.get('/with-me', authenticate, async (req, res) => {
  const { data: sharedEntries } = await supabase.from('shares').select('file_id').eq('shared_with_email', req.user.email);
  if (!sharedEntries || sharedEntries.length === 0) return res.json([]);
  
  const fileIds = sharedEntries.map(s => s.file_id);
  const { data: files } = await supabase.from('files').select('*').in('id', fileIds);
  res.json(files || []);
});

module.exports = router;