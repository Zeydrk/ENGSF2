// import {useState} from 'react';
// import {useProducts} from '../hooks/Products/useProduct';

// export default function  Products(){
//     const [showForm, setShowForm] = useState(false);
//     const products = useProducts();

//     const handleForm = () => {
//         setShowForm(true);
//     }

//     function FormComponent(){
//         const products = useProducts();
//         async function HandleSubmit(e){
//             e.preventDefault();

//             const data = new FormData(e.target);
//             const product ={
//                 product_Name: data.get('p_Name'),
//                 product_Price: data.get('p_Price')
//             };
//             await products.createProducts(product);
//         }
//         return (
//       <div className='createStudent'>
//         <form onSubmit={HandleSubmit}>{/*this da event*/}
//           <div className='mt-6'>
//             <label>
//               Product Name: 
//             <input type='text' name='p_Name' placeholder='Product Name'   />{/** Controlled components pamore */}
//             </label>
//           </div>
//           <div className='mt-6'>
//             <label>
//               Product Price: 
//             <input type='text' name='p_Price' placeholder='Product Price'   />
//             </label>
//           </div>
//           <button type='submit'>Submit</button>
//         </form>
//       </div>
//       );
//     }
    
//   return (
//    <div className='products'>
//     <div className='viewProduct'>
//       {products && {
        
//       }}      
//     </div>
   
//     <div className='createProduct'>
//         <button  onClick={handleForm}>Add Product </button>
//         {showForm && <FormComponent/>}
//     </div>
//     </div>
//   )
// }

