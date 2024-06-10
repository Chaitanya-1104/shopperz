import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProductPage = () => {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState('laptop');
    const [sortBy, setSortBy] = useState('REVIEWS');

    const handleInputChange = (event) => {
        setQuery(event.target.value); // Update the query state with user input
    };

    const handleSearch = () => {
        // Perform API request with the user's query and sort option
        const options = {
            method: 'GET',
            url: 'https://real-time-amazon-data.p.rapidapi.com/search',
            params: {
                query: query,
                country: 'IN',
                sort_by: sortBy
            },
            headers: {//323950a9dbmsh971dbeddb8dad62p1c4815jsn0feb87d76081
                'X-RapidAPI-Key': 'e6bd426d2dmsh9f8d19d4de8f99fp12ae5ajsnb83039dcbc75', //key=323950a9dbmsh971dbeddb8dad62p1c4815jsn0feb87d76081
                'X-RapidAPI-Host': 'real-time-amazon-data.p.rapidapi.com'
            }
        };

        axios.request(options)
            .then(response => {
                console.log(response);
                setProducts(response.data.data.products);

            })
            .catch(error => {
                setError(error.message || 'An error occurred while fetching products.');
                console.error('Error fetching products:', error);
            });
    };

    useEffect(() => {
        // Fetch products initially when the component mounts
        handleSearch();
    }, []);

    const handleSortChange = (event) => {
        setSortBy(event.target.value);
    };

    return (
        <div>
            <div className="search-container">
                <input type="text" value={query} onChange={handleInputChange} placeholder="Enter your search query" />
                <button onClick={handleSearch}>Search</button>

                <label htmlFor="sortBy">Sort By:</label>
                <select id="sortBy" value={sortBy} onChange={handleSortChange}>
                    <option value="NEWEST">Newest</option>
                    <option value="LOWEST_PRICE">Lowest Price</option>
                    <option value="BEST_SELLERS">Best Sellers</option>
                    <option value="REVIEWS">Reviews</option>
                </select>
            </div>
            <main>
                <div className="products-container container flex">
                    {products.map((product, index) => (
                        <div key={index} className="product">
                            <div className="product-header">
                                <a href={product.product_url} target="_blank" rel="noopener noreferrer">
                                    <img src={product.product_photo} alt="product-image" />
                                </a>
                            </div>
                            <div className="product-content">
                                <h3>{product.product_title}</h3>
                                <p className="product-price">{product.product_price}</p>
                                <p className="product-rating">Rating: {product.product_star_rating}</p>
                                <p className="product-sales-volume">Sales Volume: {product.sales_volume}</p>
                                <a href={product.product_url} target="_blank" rel="noopener noreferrer">View Product</a>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default ProductPage;
