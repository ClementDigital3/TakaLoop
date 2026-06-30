const CollectionPoint = require('../models/CollectionPoint');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

exports.getCollectionPoints = async (req,res) => {
  try {
    const {county,ward,active=true} = req.query;
    const query = {};
    if (county) query['location.county']=county;
    if (ward) query['location.ward']=ward;
    if (active) query.isActive=true;
    const points = await CollectionPoint.find(query).populate('officer','name phone');
    res.json({success:true,points});
  } catch(e){res.status(500).json({success:false,message:e.message});}
};

exports.createCollectionPoint = async (req,res) => {
  try {
    const qrData = `CP-${uuidv4()}`;
    const qrCode = await QRCode.toDataURL(qrData);
    const cp = await CollectionPoint.create({...req.body, qrCode});
    res.status(201).json({success:true,cp});
  } catch(e){res.status(500).json({success:false,message:e.message});}
};

exports.updateCollectionPoint = async (req,res) => {
  try {
    const cp = await CollectionPoint.findByIdAndUpdate(req.params.id,req.body,{new:true});
    res.json({success:true,cp});
  } catch(e){res.status(500).json({success:false,message:e.message});}
};
