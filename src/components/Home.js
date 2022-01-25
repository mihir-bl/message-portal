import React, { useState, useEffect, useRef } from "react";
import web3modal from '../helpers/web3modal'
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import contractABI from "../abi/abi.json"
import { Button } from "@chakra-ui/react"
import LOGO from "../images/Unstoppable Domains-Sign-Mono-Dark.svg"
import proxyAbi from "../abi/proxy_abi.json"
const Moralis = require('moralis');

export default function Home() {

    const contractAddress = "0x5a87E2C9FdeEc3577171D382d112B47D6aaAD337";
    const proxyAddress = "0xA3f32c8cd786dc089Bd1fC175F2707223aeE5d00";
    const [allWaves, setAllWaves] = useState([]);
    const msgRef = useRef()
    const serverUrl = "https://jgmsyant2jg0.usemoralis.com:2053/server";
    const appId = "9o0WluuFBIeNvNU9cM27xi2tnoFbC56SBZQPfc2z";
    Moralis.start({ serverUrl, appId });

    let navigate = useNavigate();
    const { user, setUser, instance, setInstance, name, setName } = useAuth() 

    const wave = async() => {
        /*fetch('https://deep-index.moralis.io/api/v2/'+user+'/nft?chain=matic', {
            headers: {
                'x-api-key': 'Jjc0BKejRj4Vk1TDxE5gvdAaBjk3DMDxm0dNJQYcXsv2g1RJURmru8W0Zw6YkTwa',
                accept: 'application/json'
            }
        }).then((res)=>{
            console.log(res)
        })*/
        if(!user) {
            alert("You need to login to send messages");
            return;
        }
        const provider = new ethers.providers.Web3Provider(instance);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI.abi, signer);

        wavePortalContract.wave(msgRef.current.value).then(()=>{
            setTimeout(() => {
                window.location.reload();
            }, 5000);
        });
    }

    const handleLogin = async(e) => {
        e.preventDefault()

        
        console.log(typeof(token_ID))

        if(user) {
            setUser(undefined);
            return;
        }
        const instanceProvider = await web3modal.connect();
        setInstance(instanceProvider)
        const provider = new ethers.providers.Web3Provider(instanceProvider);
        //const provider = new ethers.providers.getDefaultProvider(window.ethereum)
        const signer = provider.getSigner();

        const addr = await signer.getAddress()
        setUser(await signer.getAddress())

        try {
            const options = { chain: 'matic', address: addr };
            const polygonNFTs = await Moralis.Web3API.account.getNFTs(options);
            let token_ID;
            for(let i=0; i<polygonNFTs.result.length; i++) {
                if(polygonNFTs.result[i].token_address==="0xa9a6a3626993d487d2dbda3173cf58ca1a9d9e9f") {
                    token_ID = polygonNFTs.result[i].token_id;
                    break;
                }
            }
            let proxyReaderContractInstance = new ethers.Contract(proxyAddress, proxyAbi.abi, signer); // Get a proxy reader contract instance using web3 or ethers
  
            let tokenUri = await proxyReaderContractInstance.tokenURI(token_ID); // call the tokenURI method
            
            let metadataResponse = await fetch(tokenUri); // GET data from URI
            let metadata = await metadataResponse.json(); // Parse it as json
            setName(metadata.name)
            console.log(name)
            console.log(metadata.name);
        } catch(err) {
            console.log(err)
        }

        getAllWaves()
        navigate("/", { replace: false });
    }

    const handleLogout = () => {
        setUser(undefined)
    }

    const getAllWaves = async () => {
        try {
          const { ethereum } = window;
          if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const wavePortalContract = new ethers.Contract(contractAddress, contractABI.abi, signer);

            const waves = await wavePortalContract.getAllWaves();

            let wavesCleaned = [];
            waves.forEach(wave => {
                wavesCleaned.push({
                    address: wave.waver,
                    timestamp: new Date(wave.timestamp * 1000),
                    message: wave.message
                });
            });
    
            setAllWaves(wavesCleaned);
          } else {
            console.log("Ethereum object doesn't exist!")
          }
        } catch (error) {
          console.log(error);
        }
    }

    useEffect(() => {
        let isConnected = true;
        if(isConnected) {
            getAllWaves()
        }
        
        return () => {
            isConnected = false;
        };
    }, []);
    
    return (
        <div className="mainContainer">

        <div className="dataContainer">
            <div className="header">
            Hey there!
            </div>

            <div className="bio">
            I am fitbhai and I love NFTs. Connect with Unstoppable and wave at me!
            </div>
            <p>
                This app runs on the Polygon/Matic Mainnet.
            </p>
            {user ? 

            <>
            <Button
            className="authButton"
            backgroundColor={'#4b47ee'}
            _hover={{
                bg: '#0b24b3'
            }}
            _active={{
                bg: '#5361c7'
            }}
            color={'white'} leftIcon={<img style={{height: "20px"}} src={LOGO} alt="logo"/>}
            >
            {name}
            </Button>
            <Button
            className="authButton"
            onClick={handleLogout}
            backgroundColor={'#4b47ee'}
            _hover={{
                bg: '#0b24b3'
            }}
            _active={{
                bg: '#5361c7'
            }}
            color={'white'} leftIcon={<img style={{height: "20px"}} src={LOGO} alt="logo"/>}
            >
            Log Out
            </Button>
            </>
            :
            <Button
            className="authButton"
            onClick={handleLogin}
            backgroundColor={'#4b47ee'}
            _hover={{
                bg: '#0b24b3'
            }}
            _active={{
                bg: '#5361c7'
            }}
            color={'white'} leftIcon={<img style={{height: "20px"}} src={LOGO} alt="logo"/>}
            >
            Login with Unstoppable
            </Button>
            
            }
            
            
            <form>
                <label htmlFor="wave"/>
                <input id="wave" type="text" style={{marginTop: "20px",  width: "98%", height: "30px"}} placeholder="Type your message" ref={msgRef}/>
            </form>
            <button className="waveButton" onClick={wave}>
                Send a message.
            </button>
            {allWaves.map((wave, index) => {
            return (
                <div key={index} style={{ backgroundColor: "LightBlue", marginTop: "16px", padding: "8px" }}>
                <div>Address: {wave.address}</div>
                <div>Time: {wave.timestamp.toString()}</div>
                <div>Message: {wave.message}</div>
                </div>
                )
            })}
        </div>
        </div>
    );
}