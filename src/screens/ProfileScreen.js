import React from 'react'
import { Container, Col, Row } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { selectUser } from '../features/userSlice'
import { auth } from '../firebase'
import Nav from '../Nav'
import './ProfileScreen.css'
import TokenScreen from './TokenScreen'

function ProfileScreen() {
  const user = useSelector(selectUser);
  return (
    <div className='profileScreen'>
        <Nav />
        <div className='profileScreen__body'>
            <h1>Edit Profile</h1>
            <div className='profileScreen__info'>
                <div className='profileScreen__details'>
                <Container>
                <Row md={3} className="profileScreen__credrow">
                <Col md={3} className='profileScreen__label'>Email ID : </Col>
                <Col md={3}><h4>{user.email}</h4> </Col>
                </Row>
                <Row md={3} className="profileScreen__credrow">
                <Col md={3} className='profileScreen__label'>Public Key : </Col>
                <Col md={3}><input type="text" value="hi"></input></Col>
                </Row>
                <Row>
                <Col md={6}>
                <button onClick={() => auth.signOut()} 
                    className='profileScreen__linkaccount'>Link Ethereum Account</button>
                </Col>
                </Row>
                </Container>
                </div>
            </div>
            <br/>
                <h1>Update Password</h1>
                <div className='profileScreen__info'>
                <div className='profileScreen__details'>
                <Container>
                <Row md={3} className="profileScreen__credrow">
                <Col md={4} className='profileScreen__label'>Old Password : </Col>
                <Col md={3}><input type="text"></input></Col>
                </Row>
                <Row md={3} className="profileScreen__credrow">
                <Col md={4} className='profileScreen__label'>New Password : </Col>
                <Col md={3}><input type="text"></input></Col>
                </Row>
                <Row md={3} className="profileScreen__credrow">
                <Col md={4} className='profileScreen__label'>Confirm : </Col>
                <Col md={3}><input type="text"></input></Col>
                </Row>
                <Row>
                <Col md={2}>
                <button onClick={() => auth.signOut()} 
                    className='profileScreen__updatepwd'>Submit</button>
                </Col>
                </Row>
                </Container>
                </div>
            </div>





                    {/* <div className='profileScreen__tokens'>
                    <h3>Tokens</h3>
                    <TokenScreen />
                        <button onClick={() => auth.signOut()} 
                        className='profileScreen__signOut'>Sign Out</button>
                    </div> */}
        </div>
    </div>
  )
}

export default ProfileScreen