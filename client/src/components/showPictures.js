import React, { useState } from 'react';
import PropTypes from 'prop-types';

const ShowPictures = ({ question }) => {
  const [transform, setTransform] = useState("scale(1)");

  const toBigImg = () => {
    if (transform === "scale(1)") {
      setTransform("scale(2.5)")
      let img = document.getElementById("img1");

      img.style.position = "absolute"
      img.style.top = "8%"
    }
    else {
      setTransform("scale(1)")
      let img = document.getElementById("img1");

      img.style.position = ""
      img.style.top = ""
    }
  }

  return (
    <div style={{
      display: "flex", justifyContent: "center", transition: "transform 0.25s",
      transform: transform,
    }}>
      {question.image !== undefined ?
        <div style={{ height: "300px", display: "flex", justifyContent: "center", marginBottom: "3%", }}>
          <img id="img1" onClick={toBigImg} style={{ height: "100%", cursor: "pointer", border: "1px solid black" }} src={question.image} alt="pictures"></img>
        </div>
        : <></>}
    </div>
  );
}

ShowPictures.propTypes = {
  question: PropTypes.object.isRequired
};

export default ShowPictures;