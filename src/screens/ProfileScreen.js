import React, { useRef, useState } from 'react'
import { Container, Col, Row } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { login, selectUser } from '../features/userSlice'
import { auth } from '../firebase'
import Nav from '../Nav'
import './ProfileScreen.css'
import TokenScreen from './TokenScreen'
import firebase from 'firebase/compat/app';
import { useNavigate } from 'react-router-dom'
import $ from "jquery";
import { admin, PPUTokenABI, PPUTokenAddress, PPUTokenSaleABI, PPUTokenSaleAddress } from '../abi'

const Web3 = require("web3");
let metamaskEnabled = true;
const web3 = new Web3(window.ethereum);

const PPUToken = new web3.eth.Contract(PPUTokenABI,PPUTokenAddress)
const PPUTokenSale = new web3.eth.Contract(PPUTokenSaleABI,PPUTokenSaleAddress)

function ProfileScreen() {
  const user = useSelector(selectUser);
  const oldRef = useRef(null)
  const newRef = useRef(null)
  const confirmRef = useRef(null)
  const publickeyRef = useRef(null)
  const initialTokensRef = useRef(null)
  const buyTokensRef = useRef(null)
  const sendTokensRef = useRef(null)
  const sendAddressRef = useRef(null)
  const sellTokensRef = useRef(null)
  const claimAmtRef = useRef(null)
  const [availableTokens, setAvailableTokens] = useState(0)
  const [ownedTokens, setOwnedTokens] = useState(0)
  const [soldTokens, setSoldTokens] = useState(0)
  const [tokenPrice, setTokenPrice] = useState(0)
  const [amtCollected, setAmtCollected] = useState(0)
  const navigate = useNavigate()

  const getPublicKey = function()
  {
    enableMetamask.then(
    () =>  
      {
        getMetamaskAccounts();
      }
    )
    .catch(
    () =>
      {
          metamaskEnabled = false;
      }
    )
  }

  const generateNonce = function() 
  {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < 100; i++) 
    {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return web3.utils.sha3(text);
  }

  const enableMetamask = new Promise((resolve, reject) =>
  {
    if (window.ethereum) 
    {
      window.ethereum.enable()
      .then(resolve())
      .catch(reject())
    }
    else
    {
      reject();
    }
  });

  function getMetamaskAccounts()
  {
      web3.eth.getAccounts(
      (err, res) =>
      {
          if (err)
          {
              window.alert('Could not retrieve Metamask Account !!')
          }
          else
          {
              if (res.length > 0 )
              {
                  const public_address=res[0]
                  $("#public_key").val(public_address)
              }
              else
              {
                  metamaskEnabled = false;
              }
          }
      })
  }

  window.onload= getPublicKey()

  function validate_user(public_address, validation_address)
  {
      if (public_address.toLowerCase()===validation_address)
      {
        const localuser = {
          uid : user.uid,
          email : user.email,
          public_key : public_address
        }
        localStorage.setItem("user",JSON.stringify(localuser))
        window.location.reload(false)
      }
      else
      {
          alert("Signature Verification Failed !!")
      }
  }

  function recover_address(nonce, signature, public_address)
  {
      web3.eth.personal.ecRecover(nonce, signature,
      (err,result) =>
      {
          if (err)
          {
              alert('Failed to verify.. try again later..')
          }
          else
          {
              const validation_address=result
              validate_user(public_address, validation_address);
          }
      })
  }

  function sign_message(nonce,public_address)
  {
      web3.eth.personal.sign(nonce,public_address,
      (err,result) =>
      {
          if (err)
          {
              alert('Failed to sign message!!')
          }
          else
          {
              const signature=result
              recover_address(nonce,signature,public_address);
          }
      })
  }

  const linkAccount = (e) => {
    e.preventDefault()
    const nonce = generateNonce()
    const public_key = publickeyRef.current.value
    try
    {
      web3.utils.toChecksumAddress(public_key)
    }
    catch
    {
      alert('Please enter valid ethereum address..')
    }
    try
    {
      sign_message(nonce,public_key)
    }
    catch
    {
      alert('Please sign with metamask account..')
    }
  }

  const signout = () => {
    localStorage.removeItem('user')
    auth.signOut()
    navigate("/")
  }

  const updatePassword = (e) => {
    e.preventDefault()
    const oldpwd = oldRef.current.value
    const newpwd = newRef.current.value
    const confirmpwd = confirmRef.current.value

    const credential = firebase.auth.EmailAuthProvider.credential(
        user.email,
        oldpwd
      );

      firebase.auth().currentUser.reauthenticateWithCredential(credential).then(function() 
      {
         if (newpwd === confirmpwd)
         {
            firebase.auth().currentUser.updatePassword(newpwd).then(() => 
            {
                alert('Password updated successfully !!')
              }).catch((error) => {
                alert('Error occured..')
              });
         }
         else
         {
             alert('passwords do not match..')
         }
      }).catch(function(error) {
        alert('Please enter correct old password..')
      });
  }

  const startSale = (e) => {
    e.preventDefault()
    const tokenAmount = initialTokensRef.current.value
    PPUTokenSale.methods.initialTransfer(tokenAmount)
    .send({ from: (JSON.parse(localStorage.getItem('user'))?.public_key || user?.public_key) })
    .then(() => {window.alert('Success : Token Sale Started !!');
    window.location.reload(false);})
    .catch((err)=>{window.alert('Error : ' + err.message)})
  }

  const sellTokens = (e) => {
    e.preventDefault()
    const tokenAmount = sellTokensRef.current.value
    PPUTokenSale.methods.sellTokens(tokenAmount)
    .send({ from: JSON.parse(localStorage.getItem('user'))?.public_key || user?.public_key})
    .then(() => {window.alert('Success : Tokens Sold !!');
    window.location.reload(false);})
    .catch((err)=>{window.alert('Error : ' + err.message)})
  }


  const buyTokens = (e) => {
    e.preventDefault()
    const tokenAmount = buyTokensRef.current.value
    PPUTokenSale.methods.buyTokens(tokenAmount)
    .send({ from: JSON.parse(localStorage.getItem('user'))?.public_key || user?.public_key, 
    value: (web3.utils.toWei(String(tokenPrice*tokenAmount))) })
    .then(() => {window.alert('Success : Tokens Bought !!');
    window.location.reload(false);})
    .catch((err)=>{window.alert('Error : ' + err.message)})
  }

  const sendTokens = (e) => {
    e.preventDefault()
    const tokenAmount = sendTokensRef.current.value
    const receiverAddress = sendAddressRef.current.value
    PPUToken.methods.transfer(receiverAddress,tokenAmount)
    .send({ from: JSON.parse(localStorage.getItem('user'))?.public_key || user?.public_key})
    .then(() => {window.alert('Success : Tokens Sent !!');
    window.location.reload(false);})
    .catch((err)=>{window.alert('Error : ' + err.message)})
  }

  const endSale = (e) => {
    e.preventDefault()
    PPUTokenSale.methods.endSale().send({ from: (JSON.parse(localStorage.getItem('user'))?.public_key || user?.public_key) })
    .then(() => {window.alert('Success : Token Sale Ended !!')
    window.location.reload(false);})
    .catch((err)=>{window.alert('Error : ' + err.message)})
  }

  const claimEther = (e) => {
    e.preventDefault()
    const ethAmount = web3.utils.toWei(claimAmtRef.current.value,"ether");
    PPUTokenSale.methods.getfunds(ethAmount).send({ from: (JSON.parse(localStorage.getItem('user'))?.public_key || user?.public_key) })
    .then(() => {window.alert('Success : ETH Collected !!')
    window.location.reload(false);})
    .catch((err)=>{window.alert('Error : ' + err.message)})
  }


  PPUToken.methods.balanceOf(PPUTokenSaleAddress)
  .call()
  .then((result) => {
    setAvailableTokens(result)
  })

  if (JSON.parse(localStorage.getItem('user'))?.public_key || user?.public_key)
  {
      PPUToken.methods.balanceOf(JSON.parse(localStorage.getItem('user'))?.public_key || user?.public_key)
      .call()
      .then((result) => {
        setOwnedTokens(result)
      })
  }

  PPUTokenSale.methods.tokensSold()
      .call()
      .then((result) => {
        setSoldTokens(result)
      })

      PPUTokenSale.methods.tokenPrice()
      .call()
      .then((result) => {
        setTokenPrice(web3.utils.fromWei(result,"ether"))
      })

      web3.eth.getBalance(PPUTokenSaleAddress, function(err, result) {
        if (err) {
          alert(err)
        } else {
          setAmtCollected(web3.utils.fromWei(result, "ether") + "  ETH")
        }
      })


  return (
    <div className='profileScreen'>
        <Nav />
        <div className='profileScreen__body left'>
            <h1 className='profileScreen__heading1'>Edit Profile</h1>
            <div className='profileScreen__info'>
                <div className='profileScreen__details'>
                <Container>
                <Row md={3} className="profileScreen__credrow">
                <Col md={3} className='profileScreen__label'>Email ID : </Col>
                <Col md={3}><h4 className='profileScreen__heading4'>{user.email}</h4> </Col>
                </Row>
                <Row md={3} className="profileScreen__credrow">
                <Col md={3} className='profileScreen__label'>Public Key : </Col>
                <Col md={3}><input id="public_key" ref={publickeyRef} className='profileScreen__input' type="text"></input></Col>
                </Row>
                <Row>
                <Col md={6}>
                <button onClick={linkAccount} 
                    className='profileScreen__linkaccount'>Link Ethereum Account</button>
                </Col>
                </Row>
                </Container>
                </div>
            </div>
            <br/>
                <h1 className='profileScreen__heading1'></h1>
                <div className='profileScreen__info'>
                <div className='profileScreen__details'>
                <Container>
                <Row md={3} className="profileScreen__credrow">
                <Col md={3} className='profileScreen__label'>Old : </Col>
                <Col md={3}><input className='profileScreen__input' ref={oldRef} type="password"></input></Col>
                </Row>
                <Row md={3} className="profileScreen__credrow">
                <Col md={3} className='profileScreen__label'>New : </Col>
                <Col md={3}><input className='profileScreen__input' ref={newRef} type="password"></input></Col>
                </Row>
                <Row md={3} className="profileScreen__credrow">
                <Col md={3} className='profileScreen__label'>Confirm : </Col>
                <Col md={3}><input className='profileScreen__input' ref={confirmRef} type="password"></input></Col>
                </Row>
                <Row>
                <Col md={3}>
                <button type="submit" onClick={updatePassword} 
                    className='profileScreen__updatepwd'>Update Password</button>
                </Col>
                <Col md={5}>
                <button type="submit" onClick={signout} 
                        className='profileScreen__signOut'>Sign Out</button>
                </Col>
                </Row>
                <Row>
                </Row>
                </Container>
                </div>
            </div>
        </div>

        <div className='profileScreen__sep'></div>

        <div className='profileScreen__body right'>
            <h1 className='profileScreen__heading1'>Token Store</h1>
            <div className='profileScreen__info'>
                <div className='profileScreen__details'>
                <Container>
                <Row md={3} className="profileScreen__credrowright">
                <Col md={3} className='profileScreen__labelright'>ETH Address : </Col>
                <Col md={3}><input disabled className='profileScreen__input' type="text" value={JSON.parse(localStorage.getItem('user'))?.public_key || user.public_key || ''}></input></Col>
                </Row>
                <Row md={3} className="profileScreen__credrowright">
                <Col md={4} className='profileScreen__labelright'>Tokens Owned : </Col>
                <Col md={2}><input disabled className='profileScreen__inputavailabletokens' type="text" value={ownedTokens}></input></Col>
                </Row>
                <Row md={3} className="profileScreen__credrowright">
                <Col md={4} className='profileScreen__labelright'>Tokens Available : </Col>
                <Col md={2}><input disabled className='profileScreen__inputavailabletokens' type="text" value={availableTokens}></input></Col>
                </Row>
                <Row md={3} className="profileScreen__credrowright">
                <Col md={4} className='profileScreen__labelright'>Tokens Sold : </Col>
                <Col md={2}><input disabled className='profileScreen__inputavailabletokens' type="text" value={soldTokens}></input></Col>
                </Row>
                <Row md={3} className="profileScreen__credrowright">
                <Col md={4} className='profileScreen__labelright'>Token Price : </Col>
                <Col md={2}><input disabled className='profileScreen__inputavailabletokens' type="text" value={tokenPrice + "  ETH"}></input></Col>
                </Row>
                <h1 className='profileScreen__heading1'></h1>


                {((JSON.parse(localStorage.getItem('user'))?.public_key || user?.public_key) 
                && (admin===(JSON.parse(localStorage.getItem('user'))?.public_key || user?.public_key))) ?
                (
                <>
                <Row>
                <Col md={3}><input id="initial_tokens" ref={initialTokensRef} 
                className='profileScreen__inputinitialtokens' placeholder='Enter tokens for sale..' type="number"></input></Col>
                <Col md={3}>
                <button onClick={startSale} 
                    className='profileScreen__startsale'>Start Token Sale</button>
                </Col>
                <Col md={3}>
                <button onClick={endSale} 
                    className='profileScreen__endsale'>End Token Sale</button>
                </Col>
                </Row>
                <h1 className='profileScreen__heading1'></h1>
                <Row className="profileScreen__credrowright">
                <Col md={4} className='profileScreen__labelrightamt'>Amount Collected : </Col>
                <Col md={2}><input disabled className='profileScreen__inputavailabletokens' type="text" value={amtCollected}></input></Col>
                </Row>
                <Row>
                <Col md={3}><input ref={claimAmtRef} 
                className='profileScreen__claiminput' placeholder='Enter amount to collect..' type="number"></input></Col>
                <Col md={3}>
                <button onClick={claimEther} 
                    className='profileScreen__claimethbtn'>Claim ETH</button>
                </Col>
                </Row>
                </>
                ) :
                (
                <>
                <Row>
                <Col md={3}><input id="initial_tokens" ref={buyTokensRef} 
                className='profileScreen__inputinitialtokens' placeholder='Enter tokens to buy..' type="number"></input></Col>
                <Col md={3}>
                <button onClick={buyTokens} 
                    className='profileScreen__buytokensbtn'>Buy Tokens</button>
                </Col>
                </Row>
                <h1 className='profileScreen__heading1'></h1>
                <Row>
                <Col md={3}><input id="initial_tokens" ref={sellTokensRef} 
                className='profileScreen__inputinitialtokens' placeholder='Enter tokens to sell..' type="number"></input></Col>
                <Col md={3}>
                <button onClick={sellTokens} 
                    className='profileScreen__buytokensbtn'>Sell Tokens</button>
                </Col>
                </Row>


                <h1 className='profileScreen__heading1'></h1>
                <Row>
                <Col md={3}><input id="initial_tokens" ref={sendTokensRef} 
                className='profileScreen__inputinitialtokens' placeholder='Enter tokens to send..' type="number"></input></Col>
                <Col md={3}><input id="initial_tokens" ref={sendAddressRef} 
                className='profileScreen__inputreceiveraddress' placeholder='Enter receiver address..' type="text"></input></Col>
                <Col md={3}>
                <button onClick={sendTokens} 
                    className='profileScreen__sendtokensbtn'>Send Tokens</button>
                </Col>
                </Row>
                </>
                )}
                </Container>
                </div>
            </div>
        </div>
    </div>

    

    
    
  )
}

export default ProfileScreen