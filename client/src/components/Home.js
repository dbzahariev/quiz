import React, { Fragment, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { correctImages, wrongImages } from "../components/ShowMeme"
import axios from 'axios'

const Home = () => {
    const [imagesFromDb, setImagesFromDb] = useState([])

    useEffect(() => {
        axios.get(`/api/all`)
            .then(res => {
                let images = (res.data.filter((el) => el.image !== undefined)).map((el) => el.image)
                setImagesFromDb(images)
            })
            .catch(err => {
                console.log(err);
            });
    }, [])

    return (
        <Fragment>
            <div style={{ width: "100px", height: "100px", backgroundColor: "red", display:"none" }}>
                {[...correctImages, ...wrongImages, ...imagesFromDb].map((link, index) =>
                    <img style={{ width: "50px", }} key={index} src={link} alt={"image " + index} />
                )}
            </div>
            <Helmet><title>Куиз - Начало</title></Helmet>
            <div id="home">
                <section>
                    <div style={{ textAlign: 'center' }}>
                        <span className="mdi mdi-cube-outline cube"></span>
                    </div>
                    <h1>Куиз</h1>
                    <div className="playButtonContainer">
                        <ul>
                            <li>
                                <Link className="playButton" to="/play">Нов Куиз</Link>
                            </li>
                        </ul>
                    </div>
                    <div className='gamesContainer'>
                        <Link to="/play/host">Водещ</Link>
                        <Link to="/gameColorCheck">Играй провери цвета</Link>
                        {localStorage.getItem("adminPass") === "1" ?
                            <Link to="/addNewQuestion">Добави нов въпрос</Link> : <></>}
                    </div>
                </section>
            </div>
        </Fragment>
    );
}

export default Home;