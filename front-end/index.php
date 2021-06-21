<!doctype html>
<html>
    <head>
        <title>Shopping.io Staking Platform</title>
        <link href="https://shopping.io/wp-content/themes/shopping.io/img/favicon3.ico" rel="shortcut icon">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="css/main.css?v=<?=time();?>">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" integrity="sha512-iBBXm8fW90+nuLcSKlbmrPcLa0OT92xO1BIsZ+ywDWZCvqsWgccV3gFoRBv0z+8dLJgyAHIhR35VZc2oM/gI1w==" crossorigin="anonymous" referrerpolicy="no-referrer" />
        <script src="js/web3.min.js?v=<?=time();?>"></script>
    </head>
    <body>
        <div class="loadingscreen">
            <div><i class="fas fa-spinner fa-spin"></i></div>
        </div>
        
        <div class="header flex space-between align-center">
            <div class="flex">
                <img src="https://shopping.io/wp-content/uploads/2020/09/logo-shopping.png" style="width:100%;vertical-align:middle;margin:0 10px;max-width:200px;">
            </div>
            <div class="flex">
                <div id="Navigation" class="navigation flex align-center">
                    <div class="link leftright5px"><a href="#" target="_blank">Medium</a></div>
                    <div class="link leftright5px"><a href="#" target="_blank">FAQ</a></div>
                </div>
                <div id="Wallet" class="flex align-center">
                    <button id="Connect">Connect</button>
                </div>
            </div>
        </div>
        <div class="content">
            
            <!-- Deposit -->
            <div class="section deposit flex col panel">
                <div class="flex col">
                    <div class="subsection flex col">
                        <h2>Deposit</h2>
                        <div class="flex">
                            <div class="label-small flex">Entering the pool charges a 2% fee on your deposit amount which gets distributed to current share holders proportional to their share size</div>
                        </div>
                    </div>
                    <div class="subsection depositInput flex col">
                        <div class="label"><span class="coin"></span><span class="erc20Balance left5px">0.00</span> available</div>
                        <div class="flex">
                            <input id="depositInput" type="number" min="0">
                            <button id="depositToken" class="leftright5px">Confirm</button>
                        </div>
                        <div class="label-small topbottom5px font-90p"><span>You will get</span> <span id="amtToDeposit">0.00</span> <!--<span class="coin"></span>-->shares <span>added to your staking balance</span></div>
                    </div>
                    <div class="subsection allowanceInput flex col">
                        <div class="label-small topbottom5px">Please enable <span class="coin"></span> to be used on this platform!</div>
                        <div class="flex">
                            <button id="enableToken" class="topbottom5px">Enable</button>
                        </div>
                    </div>
                </div>
                <div class="wallpaper"></div>
            </div>
            
            <!-- Withdraw -->
            <div class="section withdraw flex col panel">
                <div class="flex col">
                    <div class="subsection flex col">
                        <h2>Withdraw</h2>
                        <div class="flex">
                            <div class="label-small flex">Exiting the pool charges a 2% fee on your withdraw amount which gets distributed to current share holders proportional to their share size</div>
                        </div>
                    </div>
                    <div class="subsection flex col">
                        <div class="label"><!--<span class="coin"></span>--><span class="availableDepositBalance">0.00</span> shares available (<span class="percentInPool"></span>% of total)</div>
                        <div class="flex">
                            <input id="withdrawInput" type="number" min="0">
                            <button id="withdrawToken" class="leftright5px">Confirm</button>
                        </div>
                        <div class="label-small topbottom5px font-90p"><span>You will get approx.</span> <span id="amtToWithdraw">0.00</span> <span class="coin"></span> <span>in your wallet</span></div>
						<div class="label-small topbottom5px"><span id="dividendsMsg">No dividends...</span></div>
                        <div class="label-small topbottom5px"><span id="dripRewardsMsg">No drip rewards...</span></div>
                    </div>
                </div>
                <div class="wallpaper"></div>
            </div>
            
            <!-- Extended staking -->
            <div class="section extended flex col panel">
                <div class="flex col">
                    <div class="subsection flex col">
                        <h2>Extended staking</h2>
                        <div class="flex">
                            <div class="label-small flex">Lock your stake for a fixed period of time to earn higher bonuses</div>
                        </div>
                    </div>
                    <div class="subsection flex col">
                        <div class="label"><!--<span class="coin"></span>--><span class="availableDepositBalance">0.00</span> shares available</div>
                        <div class="flex optionselect">
                            <input id="extendedStakeInput" type="number" min="0">
        					<select name="stakeOption" id="stakeOption">
        						<option value="0">30 days (+50%)</option>
        						<option value="1">60 days (+125%)</option>
        						<option value="2">90 days (+238%)</option>
        					</select>
                            <button id="extendedStake" class="leftright5px">Confirm</button>
                        </div>
                        <div class="label-small flex"></div>
                    </div>
                </div>
                <div class="wallpaper"></div>
            </div>
            
            <!-- Active stakes -->
            <div class="section activestakes flex col panel">
                <div class="flex col">
                    <div class="subsection flex col">
                        <h2>Active stakes</h2>
                        <div class="flex">
                            <div class="label-small flex col"><span>You can unlock at any time, however there is a -15% penalty if you unlock early</span></div>
                        </div>
                    </div>
                    <div class="subsection flex col">
                        <div id="activeStakesTitle" class="label flex">No active stakes found</div>
                        <div id="activeStakesList" class="flex col activeStakesList">
                            <table>
                                <tbody></tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div class="wallpaper"></div>
            </div>
            
            <!-- Notifications -->
            <div id="notifications" class="notifications flex col"></div>
        </div>
        
        <!-- Thank you -->
        <div class="watermark label-small link">Powered by <a href="https://web3.builders" target="_blank">web3.builders</a></div>
        
        <!-- Connect your wallet -->
        <div class="section connectwallet flex col">
            <div class="flex col">
                <div class="subsection flex col">
                    <h2>Connect</h2>
                    <div class="flex">
                        <div class="label-small flex col"><span>Please connect your wallet to either Ethereum MainNet or Binance Smart Chain</span></div>
                    </div>
                </div>
            </div>
            <div class="wallpaper"></div>
        </div>
        
        <!-- Admin panel -->
        <div class="section adminpanel flex col">
            <div class="close"></div>
            <div class="flex col">
                <div class="flex col">
                    <h2>Admin panel</h2>
                    <div class="flex col adminsection">
                        <div class="label-small flex col"><span>Airdrop rewards to your users (make sure you approved the token first)</span></div>
                        <div class="label"><span class="coin"></span><span class="erc20Balance left5px">0.00</span> in wallet</div>
                        <div class="flex">
                            <input id="adminDepositInput" type="number" min="0">
                            <button id="adminDepositToken" class="leftright5px">Confirm</button>
                        </div>
                    </div>
                    <div class="flex col adminsection">
                        <div class="label-small flex col"><span>Rewards available in contract</span></div>
                        <div class="label"><span class="coin"></span><span class="contractBalance left5px">0.00</span></div>
                    </div>
                    <div class="flex col adminsection">
                        <div class="label-small flex col"><span>Change the emission rate</span></div>
                        <div class="label">Current: <span class="coin"></span> <span class="per11Days"></span> <span>per 1 <span class="coin"></span> staked for 11 days</span></div>
                        <div class="flex">
                            <input id="emissionRateInput" type="number" min="0">
                            <button id="changeEmissionRate" class="leftright5px">Confirm</button>
                        </div>
                        <div id="adjustedEmissionRate" class="label-small">
                            <span class="coin"></span> <span id="newEmissionRate"></span> <span>per 1 <span class="coin"></span> staked for 11 days</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="wallpaper"></div>
        </div>
        
        <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
        <script src="js/blockies.js?v=<?=time();?>"></script>
        <script src="js/abi.js?v=<?=time();?>"></script>
        <script src="js/main.js?v=<?=time();?>"></script>
    </body>
</html>