const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const mongoose = require('mongoose');

// Helper: Validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ success: true, data: categories, count: categories.length });
  } catch (err) {
    console.error('[Categories] Get all error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

// Generate slug from name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
};

// Create category
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    // Auto-generate slug if not provided
    const categoryData = {
      ...req.body,
      slug: req.body.slug || generateSlug(name),
    };

    const category = new Category(categoryData);
    const newCategory = await category.save();
    res.status(201).json({ success: true, data: newCategory });
  } catch (err) {
    console.error('[Categories] Create error:', err.message);
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Category with this name or slug already exists' });
    }
    res.status(400).json({ success: false, message: 'Failed to create category: ' + err.message });
  }
});

// Update category
router.put('/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid category ID format' });
    }
    
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedCategory) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    res.json({ success: true, data: updatedCategory });
  } catch (err) {
    console.error('[Categories] Update error:', err.message);
    res.status(400).json({ success: false, message: 'Failed to update category: ' + err.message });
  }
});

// Delete category
router.delete('/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid category ID format' });
    }
    
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    res.json({ success: true, message: 'Category deleted successfully', data: category });
  } catch (err) {
    console.error('[Categories] Delete error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to delete category' });
  }
});

module.exports = router;
