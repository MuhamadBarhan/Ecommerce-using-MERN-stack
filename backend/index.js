const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcrypt");
const crypto=require('crypto');
const Razorpay = require('razorpay');
require('dotenv').config()
const port = process.env.PORT;

app.use(express.json());
app.use(cors());

//Database connection with MongoDB
mongoose.connect(process.env.MONGO_URL);

//API 
app.get("/", (req, res) => {
    res.send("Express App is Running");
})

//Image Storage Engine
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
})

const upload = multer({ storage: storage })

//Creating upload endpoint for images
app.use('/images', express.static('upload/images'))
app.post("/upload", upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url: `${process.env.BACKEND_URL}/images/${req.file.filename}`
    })
})

//Schema for creating products

const Product = mongoose.model("Product", {
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    new_price: {
        type: Number,
        required: true,
    },
    old_price: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
})

//API for Adding Products

app.post('/addproduct', async (req, res) => {
    let products = await Product.find({});
    let id;
    if (products.length > 0) {
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id + 1;
    }
    else {
        id = 1;
    }
    const product = new Product({
        id: id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price,
    })
    console.log(product);
    await product.save();
    console.log("Saved")
    res.json({
        success: true,
        name: req.body.name,
    })
})

//API for Deleting Products
app.post('/removeproduct', async (req, res) => {
    await Product.findOneAndDelete({ id: req.body.id });
    console.log("Removed");
    res.json({
        success: true,
        name: req.body.name,
    })
})

//Creating API for getting all Products
app.get('/allproducts', async (req, res) => {
    let products = await Product.find({});
    console.log("All Products Fetched");
    res.send(products);
})

//Schema for Users
const Users = mongoose.model('Users', {
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String
    },
    cartData: {
        type: Array,
        default: []
    },
    wishData: {
        type: Array,
        default: []
    },
    userInfo: {
        type: Array,
        default: []
    },
    date: {
        type: Date,
        default: Date.now,
    }
})

//Creating endpoint for registering user

app.post('/signup', async (req, res) => {

    let check = await Users.findOne({ email: req.body.email });

    if (check) {
        return res.status(400).json({ success: false, errors: "Existing User Found" })
    }


    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    let cart = [];
    let wishlist = [];
    let userdetails = [];
    const user = new Users({
        name: req.body.username,
        email: req.body.email,
        password: hashedPassword,
        cartData: cart,
        wishData: wishlist,
        userInfo: userdetails,
    })

    await user.save();

    const data = {
        user: {
            id: user.id
        }
    }

    const token = jwt.sign(data, 'secret_ecom');
    res.json({ success: true, token })
})

//Creating endpoint for user login
app.post('/login', async (req, res) => {
    let user = await Users.findOne({ email: req.body.email });
    if (user) {
        const passCompare = await bcrypt.compare(req.body.password, user.password);
        if (passCompare) {
            const data = {
                user: {
                    id: user.id
                }
            }
            const token = jwt.sign(data, 'secret_ecom');
            res.json({ success: true, token });
        }
        else {
            res.status(401).send({ success: false, errors: "Wrong Password" });
        }
    }
    else {
        res.status(401).send({ success: false, errors: "User not found! Please signup" });
    }
})

//Creating middleware to fetch user
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({ errors: "please authenticate" })
    }
    else {
        try {
            const data = jwt.verify(token, 'secret_ecom');
            req.user = data.user;
            next();
        } catch (error) {
            res.status(401).send({ errors: "Please autheticate using valid token" })
        }
    }
}

//Creating endpoint to save cartData
app.post('/savecart', fetchUser, async (req, res) => {
    let userData = await Users.findOne({ _id: req.user.id });
    if (!Array.isArray(userData.cartData)) {
        userData.cartData = [userData.cartData];
    }
    userData.cartData = req.body;
    await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
    res.send("Added");

});

//Creating endpoint to save wishData
app.post('/savewishlist', fetchUser, async (req, res) => {
    let userData = await Users.findOne({ _id: req.user.id });
    if (!Array.isArray(userData.wishData)) {
        userData.wishData = [userData.wishData];
    }
    userData.wishData = req.body;
    await Users.findOneAndUpdate({ _id: req.user.id }, { wishData: userData.wishData });
    res.send("Added");

});

//creating endpoint to get the cart data
app.post('/getcart', fetchUser, async (req, res) => {
    let userData = await Users.findOne({ _id: req.user.id });
    res.json(userData.cartData);

});

//creating endpoint to get the wishlist data
app.post('/getwishlist', fetchUser, async (req, res) => {
    let userData = await Users.findOne({ _id: req.user.id });
    res.json(userData.wishData);

});

// Combined endpoint to save a new address or update an existing address
app.post('/saveinfo', fetchUser, async (req, res) => {
    try {
      const userData = await Users.findById(req.user.id);
      
      // Check if the request body has an index for updating an existing address
      if (req.body.index !== undefined) {
        const { index, address } = req.body;
        
        if (index < userData.userInfo.length) {
          // Update the specific address
          userData.userInfo[index] = address;
          await userData.save();
          return res.send("Address updated successfully");
        } else {
          return res.status(400).send("Invalid address index");
        }
      } else {
        // If no index is provided, push new address into userInfo array
        userData.userInfo.push(req.body);
        await userData.save();
        return res.send("New address added successfully");
      }
    } catch (error) {
      res.status(500).send('Error saving address');
    }
  });

// DELETE endpoint to remove an address
app.post('/deleteinfo', fetchUser, async (req, res) => {
    const { index } = req.body; // Get index from request body
    console.log(index);
    const userId = req.user.id; // Assuming you have user authentication set up
  
    try {
      // Find the user
      const user = await Users.findById(userId);
      
      // Ensure the user exists
      if (!user) {
        return res.status(404).json({ message: 'User not fsound' });
      }
  
      // Ensure addresses is an array
      if (!Array.isArray(user.userInfo)) {
        user.userInfo = []; 
        console.log(user.userInfo.length);// Initialize as an empty array if it doesn't exist
      }
  
      // Remove the address at the specified index
      if (index >= 0 && index < user.userInfo.length) {
        user.userInfo.splice(index, 1); // Remove address from the array
        await user.save(); // Save the updated user
        return res.status(200).json({ message: 'Address deleted successfully' });
      } else {
        return res.status(400).json({ message: 'Invalid address index' });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  });
  
  

//Creating endpoint to get userData
app.get('/getuserinfo', fetchUser, async (req, res) => {
    try {
        let userData = await Users.findOne({ _id: req.user.id });
        if (!userData.userInfo || userData.userInfo.length === 0) {
            return res.status(404).json({ message: 'No address found' });
        }
        res.json(userData);
        console.log(userData);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



//Razorpay Payment Integration
var razorpayInstance = new Razorpay({
    key_id: 'rzp_test_1biQU72ZDIgaoF',
    key_secret: 'CoA8racU4iWMdgwcSLnGjLkn',
});

app.post('/order', (req, res) => {
    const { amount } = req.body;

    try {
        const options = {
            amount: Number(amount * 100),
            currency: "INR",
            receipt: crypto.randomBytes(10).toString("hex"),
        }

        razorpayInstance.orders.create(options, (error, order) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: "Something Went Wrong!" });
            }
            res.status(200).json({ data: order });
            console.log(order)
        });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error!" });
        console.log(error);
    }
})

app.post('/verify', async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // console.log("req.body", req.body);

    try {
        // Create Sign
        const sign = razorpay_order_id + "|" + razorpay_payment_id;

        // Create ExpectedSign
        const expectedSign = crypto.createHmac("sha256", 'CoA8racU4iWMdgwcSLnGjLkn')
            .update(sign.toString())
            .digest("hex");

        // console.log(razorpay_signature === expectedSign);

        // Create isAuthentic
        const isAuthentic = expectedSign === razorpay_signature;

        // Condition 
        if (isAuthentic) {
            // const payment = new Payment({
            //     razorpay_order_id,
            //     razorpay_payment_id,
            //     razorpay_signature
            // });

            // // Save Payment 
            // await payment.save();

            // Send Message 
            res.json({
                message: "Payement Successfully"
            });
        }
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error!" });
        console.log(error);
    }
})


app.listen(port, (error) => {
    if (!error) {
        console.log("Server running on port " + port);
    }
    else {
        console.log("Error : " + error);
    }
})
