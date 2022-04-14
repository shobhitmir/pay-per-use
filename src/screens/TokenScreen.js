import React from 'react'
import './TokenScreen.css'

function TokenScreen() {
  return (
    <div className='tokenScreen'>
        <div className='tokenScreen__option'>
            <div className='tokenScreen__optioninfo'>
                <h5>Buy Tokens</h5>
                <h6>You can use tokens to purchases movies</h6>
            </div>
            <button>Buy</button>
        </div>

    </div>
  )
}

export default TokenScreen