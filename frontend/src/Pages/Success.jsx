import React from 'react'
import { useNavigate } from 'react-router-dom'

const Success = () => {

    const navigate=useNavigate();

  return (
    <div style={{display:'flex',justifyContent:'center',flexDirection:'column',textAlign:'center', alignItems:'center',height:'80vh'}}> 
      <img height={80} width={80} src="data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22%23008022%22%20fill-rule%3D%22evenodd%22%20d%3D%22M15.67%207.06l-1.08-1.34c-.17-.22-.28-.48-.31-.77l-.19-1.7a1.51%201.51%200%200%200-1.33-1.33l-1.7-.19c-.3-.03-.56-.16-.78-.33L8.94.32c-.55-.44-1.33-.44-1.88%200L5.72%201.4c-.22.17-.48.28-.77.31l-1.7.19c-.7.08-1.25.63-1.33%201.33l-.19%201.7c-.03.3-.16.56-.33.78L.32%207.05c-.44.55-.44%201.33%200%201.88l1.08%201.34c.17.22.28.48.31.77l.19%201.7c.08.7.63%201.25%201.33%201.33l1.7.19c.3.03.56.16.78.33l1.34%201.08c.55.44%201.33.44%201.88%200l1.34-1.08c.22-.17.48-.28.77-.31l1.7-.19c.7-.08%201.25-.63%201.33-1.33l.19-1.7c.03-.3.16-.56.33-.78l1.08-1.34c.44-.55.44-1.33%200-1.88zM6.5%2012L3%208.5%204.5%207l2%202%205-5L13%205.55%206.5%2012z%22%20class%3D%22color000000%20svgShape%22%2F%3E%3C%2Fsvg%3E" alt="" />
      <h1>Payment Successful!</h1>
      <p>Thank you for your purchase. Your order is being processed.</p>
      <button onClick={()=>navigate('/')} className='formBtn'>Continue Shopping</button>
    </div>
  )
}

export default Success