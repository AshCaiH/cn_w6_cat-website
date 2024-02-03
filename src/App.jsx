import { useState, useEffect } from 'react'
import { FaCartShopping } from "react-icons/fa6";
import CatComponent from './components/Cat';
import { faker } from '@faker-js/faker';
import './App.css'
import BasketComponent from './components/Basket';
import CatInfoComponent from './components/CatInfo';
import styled from 'styled-components';
import { HashRouter, Link, Route, Routes } from 'react-router-dom';
import Home from './pages/home';
import About from './pages/about-us';

// For the eyecatch element around the basket.
const pingSize = 400;

class Cat {
  constructor (id, url, name, sex) {
      this.id = id;
      this.url = url;

      this.name = name;
      this.sex = null;

      let random = Math.random()
      switch (true) {
        case (random < 0.48):
          this.sex = "Female";
          break;
        case (random < 0.96):
          this.sex = "Male";
          break;
        default:
          this.sex = "Non-binary"
      }

      this.price = faker.number.int({min: 40, max: 300});
      this.adjective = faker.word.adjective();
      this.noun = faker.word.noun();

      // Chooses between "a" or "an" as appropriate.
      let starterWord = ["a","e","i","o","u"].includes(this.adjective[0]) ? "An" : "A";

      let pronoun = null;

      switch (this.sex) {
        case "Female": 
          pronoun = "her";
          break;
        case "Male": 
          pronoun = "her";
          break;
        default:
          pronoun = "their";
      }

      // Generates random descriptions for each cat using faker and some random phrases.
      let flourishes = ["anything to do with", "all things", "whatever seems like", "the concept of", "the sound of", "any", "your", "my", "anybody's", pronoun, "anything but"]
      let flourish = flourishes[Math.floor(Math.random()*flourishes.length )];

      let moods = ["likes", "loves", "enjoys", "is indifferent to", "wants", "is scared of", "dreads", "fancies", "rejects", "demands", "respects", "dreams about", "ignores", "freaks out at", "can't stay away from", "doesn't understand", "is all about", "believes in", "would probably like"]
      let mood = moods[Math.floor(Math.random()*moods.length)];

      this.description = `${starterWord} ${this.adjective} cat who ${mood} ${flourish} ${this.noun}.`
  }
}

function App() {
  const [rawCatData, setRawCatData] = useState([]);
  const [catObjects, setCatObjects] = useState([]);
  const [basketContents, setBasketContents] = useState([]);
  const [basketVisible, setBasketVisible] = useState(false);
  const [infoboxObject, setInfoboxObject] = useState(null);
  const [infoboxVisible, setinfoboxVisible] = useState(false);
  const [selectedCatIndex, setSelectedCatIndex] = useState(0);

  useEffect(() => {
    setRawCatData([]); // Prevent an infinite number of cats loading whenever the page rerenders.

    const fetchCats = async () => {
      const response = await fetch("https://api.thecatapi.com/v1/images/search?limit=10");
      const data = await response.json();
      // Make a second request to cover any gaps left by the items we're going to remove. 
      const response2 = await fetch("https://api.thecatapi.com/v1/images/search?limit=10");
      const data2 = await response2.json();

      // Filters out any gifs.
      const tempData = [...data, ...data2].filter((item) => {
        if (!item.url.endsWith(".gif")) return item;
      });

      // Only display the first 15. Unless there are more than 5 gifs across both requests
      // this should mean there aren't any gaps. Shouldn't break anything if there are more
      // than 5, but it should keep things more consistent overall.
      setRawCatData(tempData.slice(0, 15));
    }
    
    fetchCats();
  }, []);


  useEffect(() => {
    const tempList = [];

    rawCatData.map((item) => {
      const cat = new Cat(item.id, item.url, faker.person.firstName(), Math.random() > 0.5 ? "M" : "F")
      
      tempList.push(cat);
    })

    setCatObjects(tempList); 
  }, [rawCatData]);
  

  const addToBasket = (cat) => {
    setBasketContents([...basketContents, cat]);

    const basketBtn = document.getElementById("basketBtn");
    const ping = document.getElementById("ping");

    const pingLeft  = (basketBtn.getBoundingClientRect().x + basketBtn.getBoundingClientRect().width / 2) - pingSize / 2;
    const pingTop   = (basketBtn.getBoundingClientRect().y + basketBtn.getBoundingClientRect().height / 2) - pingSize / 2;

    
    ping.style.left = pingLeft + "px";
    ping.style.top = pingTop + "px";
    
    ping.classList.add("pinging");
  }


  const removeFromBasket = (cat) => {    
    let tempList = [...basketContents].filter((item) => item.id != cat.id);
    setBasketContents([...tempList]);
  }


  // Display info modular.
  const showInfo = (cat, selectedFromHomepage) => {
    // Stores the index of the selected cat for use by the selectNext() function.
    setSelectedCatIndex(catObjects.findIndex((item) => item == cat));

    setInfoboxObject(cat);
    setinfoboxVisible(true);
  }

  // Resets the eyecatch once it's finished playing.
  const resetPing = () => {    
    document.getElementById("ping").classList.remove("pinging");
  }

  // Handles the prev/next buttons in the cat infoboxes.
  const selectNext = (dir) => {
    let index = null;

    if (selectedCatIndex + dir >= catObjects.length) index = 0;
    else if (selectedCatIndex + dir < 0) index = catObjects.length - 1;
    else index = selectedCatIndex + dir;

    setSelectedCatIndex(index);
    showInfo(catObjects[index]);
  }

  const homeContent = () => {
    return (
      <>
        <div className="catComponents">
          {catObjects.map((cat, index) => {
            return <CatComponent key={index} cat={cat} addFunc={addToBasket} infoFunc={showInfo} removeFunc={removeFromBasket} basket={basketContents}/> 
          })}
        </div>
        
        {infoboxVisible && <CatInfoComponent cat={infoboxObject} addFunc={addToBasket} removeFunc={removeFromBasket}
                            visible={infoboxVisible} setVisible={setinfoboxVisible} basket={basketContents}
                            changeCat={selectNext}/>}
      </>
    )
  }

  return (
    <>
      <HashRouter basename="">
        <div id="banner">
          <div id="logo">
            <h1 id="header">CATalogue</h1>
            <h3 id="subtitle">Get kittied out</h3>
          </div>
          <Link to="/">Home</Link>
          <Link to="/about-us">About Us</Link>
          <div className="basketBtnHolder">
            <button id="basketBtn" onClick={() => {setBasketVisible(true)}}>{basketContents.length} <FaCartShopping /></button>
          </div>
          <Ping id="ping" onTransitionEnd={resetPing}/>
        </div>
        
        <BasketComponent contents={basketContents} visible={basketVisible} setVisible={setBasketVisible} removeFunc={removeFromBasket}/>

        <Routes>
          <Route path = "/" element={<Home content={homeContent}/>}/>
          <Route path = "/about-us" element={<About />}/>
        </Routes>
      </HashRouter>
    </>
  )
}

export default App



// Eyecatch element.
const Ping = styled.div`
  pointer-events: none;
  height:${pingSize}px;
  width: ${pingSize}px;
  border-radius: ${pingSize}px;
  background-color: grey;
  position:absolute;
  top: ${-pingSize/2}px;
  left: ${-pingSize/2}px;
  z-index: -1;
  background: radial-gradient(circle, #752c2c00 20%, #752c2c 50%, #752c2c00 100%);
  transition: scale 0.3s !important;;
  opacity: 0;
  scale: 1;

  &.pinging {
    opacity: 1;
    z-index: 5;
    scale: 0.001;
  }
`
