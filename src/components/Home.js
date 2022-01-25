import React, { useState, useEffect } from "react";
import web3modal from '../helpers/web3modal'
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import contractABI from "../abi/abi.json"

export default function Home() {

    const contractAddress = "0xa13A18218E5A81f9b9ce10239B5b5926768aEc31"
    const [allWaves, setAllWaves] = useState([]);

    let navigate = useNavigate();
    const { user, setUser, instance, setInstance } = useAuth() 

    console.log(instance)

    const wave = async() => {

        fetch('https://deep-index.moralis.io/api/v2/'+user+'/nft?chain=matic', {
            headers: {
                'x-api-key': 'Jjc0BKejRj4Vk1TDxE5gvdAaBjk3DMDxm0dNJQYcXsv2g1RJURmru8W0Zw6YkTwa',
                accept: 'application/json'
            }
        }).then((res)=>{
            console.log(res)
        })

        if(!user) return;
        const provider = new ethers.providers.Web3Provider(instance);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI.abi, signer);

        let count = await wavePortalContract.getTotalWaves();

    }

    const handleLogin = async() => {
        
        

        if(user) {
            setUser(undefined);
            return;
        }
        const instanceProvider = await web3modal.connect();
        setInstance(instanceProvider)
        const provider = new ethers.providers.Web3Provider(instanceProvider);
        const signer = provider.getSigner();

        console.log(await signer.getAddress())
        setUser(await signer.getAddress())
        getAllWaves()
        navigate("/", { replace: false });
    }

    const getAllWaves = async () => {
        try {
          const { ethereum } = window;
          if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const wavePortalContract = new ethers.Contract(contractAddress, contractABI.abi, signer);
    
            /*
             * Call the getAllWaves method from your Smart Contract
             */
            const waves = await wavePortalContract.getAllWaves();
    
    
            /*
             * We only need address, timestamp, and message in our UI so let's
             * pick those out
             */
            let wavesCleaned = [];
            waves.forEach(wave => {

                

                wavesCleaned.push({
                    address: wave.waver,
                    timestamp: new Date(wave.timestamp * 1000),
                    message: wave.message
                });
            });
    
            /*
             * Store our data in React State
             */
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
            I am Mihir and I love NFTs. Connect your Ethereum wallet and wave at me!
            </div>
            <button onClick={handleLogin}>
            {user ? "Log Out" : "Log In"}
            </button>
            <button className="waveButton" onClick={wave}>
            Wave at Me
            </button>
            {allWaves.map((wave, index) => {
            return (
                <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
                <div>Address: {wave.address}</div>
                <div>Time: {wave.timestamp.toString()}</div>
                <div>Message: {wave.message}</div>
                </div>)
            })}
        </div>
        </div>
    );
}
