import product from './models/product.js';
import mongoose from 'mongoose';



export const getproducts = async (req,res)=>{
    try {
        const products = await product.find({});
        res.status(200).json({success:true,products});
    } catch (error) {
        res.status(500).json({success:false,message:"Server Error"});
    }
};

export const createproduct = async (req,res)=>{
    const product = req.body;
    if(!product.name || !product.price || !product.image){
        return res.status(400).json({success:false,message:"Name and Price also images are required"});
    }
    const newProduct = new Product(product);
    try {
        await newProduct.save();
        res.status(201).json({success:true,message:"Product created successfully",product:newProduct});
    } catch (error) {
        res.status(500).json({success:false,message:"Server Error"});
    }
};

export const updateproduct = async (req,res)=>{
    const {id} = req.params;
    const product = req.body;
    if(!mongoose.Types.ObjectId.isValid(id)){
      return res.status(400).json({success:false,message:"Invalid product ID"});
    }
    try{
      const updatedProduct = await Product.findByIdAndUpdate(id,product,{new:true});
      res.status(200).json({success:true,message:"Product updated successfully",product:updatedProduct});
    }
    catch(error){
        res.status(500).json({success:false,message:"Server Error"});
    }
};

export const deleteproduct = async (req,res)=>{
  const {id} = req.params;
  try{
    await product.findByIdAndDelete(id);
    res.status(200).json({success:true,message:"Product deleted successfully"});
  }
catch(error){
    res.status(500).json({success:false,message:"Server Error"});
  }
};