import React, { useEffect, useState } from 'react'
import axios from "axios";
import { useDispatch, useSelector } from 'react-redux'
import toast, { Toaster } from "react-hot-toast";
import CartComp from './Components/CartComp'
import { modifyItem, removeItem } from '../redux/reducer/cart';
import './Styles/CartComp.css'
import { useNavigate } from 'react-router-dom';
import { setCartItems } from '../redux/reducer/cart';
import { baseUrl } from '../url'

const OrderSummary = () => {

  const [amount, setAmount] = useState();
  const [loading, setLoading] = useState(true);
  const list = useSelector((state) => state.cart.list);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const incrementItem = (item) => {
    dispatch(modifyItem({ ...item, count: item.count + 1 }))
  }

  const decrementItem = (item) => {
    if (item.count === 1) {
      dispatch(removeItem(item))
    }
    else {
      dispatch(modifyItem({ ...item, count: item.count - 1 }))
    }
  };

  const removeItemFromCart = (item) => {
    dispatch(removeItem(item));
  }

  const calculatePrices = () => {
    let totalPrice = 0;
    let totalDiscount = 0;
    let totalItems = 0;

    list.forEach(item => {
      const itemTotalPrice = item.old_price * item.count;
      const itemTotalDiscount = (item.old_price - item.new_price) * item.count;
      totalPrice += itemTotalPrice;
      totalDiscount += itemTotalDiscount;
      totalItems += item.count;
    });

    const totalAmount = totalPrice-totalDiscount;

    return { totalPrice, totalDiscount, totalAmount, totalItems };
  }

  useEffect(() => {
    if (localStorage.getItem('auth-token')) {
      axios.post(`${baseUrl}/getcart`, {}, {
        headers: {
          Accept: '*/*',
          'auth-token': `${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json',
        }
      })
        .then(res => {
          dispatch(setCartItems(res.data));
          setLoading(false);
          console.log(res.data);
        })
        .catch(err => {
          console.log(err);
        });
    }
  }, [dispatch]);

  const { totalPrice, totalDiscount, totalAmount, totalItems } = calculatePrices();

  useEffect(() => {
    setAmount(totalAmount);
  }, [totalAmount]);




  // handlePayment Function
  const handleSubmit = async () => {
      try {
          const res = await fetch(`${baseUrl}/order`, {
              method: "POST",
              headers: {
                  "content-type": "application/json"
              },
              body: JSON.stringify({
                  amount
              })
          });

          const data = await res.json();
          console.log(data);
          handlePaymentVerify(data.data)
      } catch (error) {
          console.log(error);
      }
  }

  // handlePaymentVerify Function
  const handlePaymentVerify = async (data) => {
      const options = {
          key: 'rzp_test_1biQU72ZDIgaoF',
          amount: data.amount,
          currency: data.currency,
          name: "MHD",
          description: "Test Mode",
          order_id: data.id,
          handler: async (response) => {
              console.log("response", response)
              try {
                  const res = await fetch(`${baseUrl}/verify`, {
                      method: 'POST',
                      headers: {
                          'content-type': 'application/json'
                      },
                      body: JSON.stringify({
                          razorpay_order_id: response.razorpay_order_id,
                          razorpay_payment_id: response.razorpay_payment_id,
                          razorpay_signature: response.razorpay_signature,
                      })
                  })

                  const verifyData = await res.json();

                  if (verifyData.message) {
                      toast.success(verifyData.message);
                      navigate('/success');
                  }
              } catch (error) {
                  console.log(error);
              }
          },
          theme: {
              color: "#008ecc"
          },
          method: {
            googlepay: true,
            upi: true,
            card: true,
            netbanking: true,
            wallet: true,
        }
      };
      const rzp1 = new window.Razorpay(options);
      rzp1.open();
  }


  return (
    <>
      {loading ? (
        <div className="loading-animation">
          <span className="loader"></span>
        </div>
      ) : (
        <>
          {list.length > 0 ? (
            <>
              <div className="cart-cont">
                <div className="cart-left-cont">
                  <div className="ct-heading"><span className="ct-heading-text">Order Summary</span></div>
                  {list.map((item) => (
                    <CartComp {...item} key={item.id} incrementItem={() => incrementItem(item)} decrementItem={() => decrementItem(item)} removeItem={() => removeItemFromCart(item)} />
                  ))}
                  <div className='place-order-cont pc'>
                    <button className='formBtn ' onClick={() => navigate('/payment')}>Continue to payment</button>
                  </div>
                </div>
                <div className="ct-right-cont">
                  <div className="ct-right-cont-heading">
                    <span className="ct-right-cont-heading-text">Price Details</span>
                  </div>
                  <div className="price-info">
                    <div className="price-item">
                      <span className="item-label">Price ({totalItems} item{totalItems > 1 ? 's' : ''})</span>
                      <span className="item-value">₹{totalPrice}</span>
                    </div>
                    <div className="price-item">
                      <span className="item-label">Discount</span>
                      <span className="item-value">− ₹{totalDiscount}</span>
                    </div>
                    <div className="price-item">
                      <span className="item-label">Delivery Charges</span>
                      <span className="item-value">Free</span>
                    </div>
                  </div>
                  <div className="price-total">
                    <div className="price-item">
                      <span className="item-label">Total Amount</span>
                      <span className="item-value">₹{totalAmount}</span>
                    </div>
                  </div>
                </div>
                <div className='place-order-cont mob'>
                  <button className='formBtn ' onClick={handleSubmit}>Continue to pay</button>
                  {/* () => navigate('/payment') */}
                </div>
              </div>
            </>
          ) : (<h3>404</h3>)}
        </>
      )}
    </>
  );
}

export default OrderSummary
