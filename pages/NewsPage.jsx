import React, { useEffect, useState } from 'react';

const NewsPage = () => {
    const [articles, setArticles] = useState([]);

    useEffect(() => {
        const API_KEY = "e05a57158bdd45b0b8bc0a06c79052f3"; //key=d7989e4e08ef4ffe9822d49942d34450
        const url = "https://newsapi.org/v2/top-headlines?country=us&category=technology&apiKey=" + API_KEY;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.articles) {
                    setArticles(data.articles);
                    console.log(data)
                }
            })
            .catch(error => console.error('Error fetching news:', error));
    }, []);

    return (
        <div>

            <main>
                <div className="cards-container container flex">
                    {articles.map((article, index) => (
                        <a key={index} href={article.url} target="_blank" rel="noopener noreferrer" className="card">
                            <div className="card-header">
                                <img src={article.urlToImage} alt="news-image" />
                            </div>
                            <div className="card-content">
                                <h3>{article.title}</h3>
                                <h6 className="news-source">{article.source.name}</h6>
                                <p className="news-desc">{article.description}</p>
                            </div>
                        </a>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default NewsPage;