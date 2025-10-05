import {useState} from 'react';
import {useProducts} from '../hooks/Products/useStudent';

export default function  Products(){
    const [showForm, setShowFrom] = useState(false);

    function FormComponent(){
        const products = useProducts();
    }
}

