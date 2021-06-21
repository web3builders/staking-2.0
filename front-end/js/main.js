// Admin address (to see Admin panel)
var adminAddress = "0x24491353934e9Dba3b49c3dD9f19dd27771aD00c"

// Ethereum mainNet staking contract
var stakingContract = "0x4e5B7E709d1D917BDD0a424236e8FAFe18317Acd"

// Ethereum mainNet $SPI token contract
var SPIContract = "0x83fc1517301cc326e2551aafde356ad50a402eaa"

// Binance Smart Chain staking contract 
var stakingContractOnBinanceChain = "0x4e5B7E709d1D917BDD0a424236e8FAFe18317Acd"

// Binance Smart Chain $GSPI contract
var GSPIContract = "0x83fc1517301cc326e2551aafde356ad50a402eaa"

/******************************************************************************/

var web3,
    accounts,
    Stake,
    Token,
    emissionRate,
    newEmissionRate,
    path = "",
    notif = new Audio("notif.wav"),
    click = new Audio("click.wav"),
    error = new Audio("error.wav")
    
var User = {
    "address" : "",
    "balance" : "",
    "allowed" : false,
    "Stake"   : {},
    "ActiveStakes" : [],
    "option"  : "0",
    "dripRewards" : ""
}

var Contract = {
    "balance" : "",
    "sTokenTotal" : "", // 2% deducted from all deposits
    "dripPool" : ""
}

var fetchTokenLoop, fetchStakingLoop, updateStakesListLoop

$(window).on("load", function() {
    $(".loadingscreen").fadeOut(1000)
})

$(document).ready(function() {
    $(".connectwallet, .adminpanel").css({
        "position" : "absolute",
        "top"      : "calc(50% - "+($(".connectwallet").outerHeight() / 2)+"px)",
        "left"     : "calc(50% - "+($(".connectwallet").outerWidth() / 2)+"px)"
    })
    
    if(window.localStorage.getItem("connected")) {
        connect()
    }
    $("#Connect").click(function() {
        connect()
    })
    
    $("input").on("input", function() {
        let val = parseFloat($(this).val())
        if(val > 0) {
            let amt = Math.round(((val * 49) / 50 + Number.EPSILON) * 100) / 100
            switch($(this).attr("id")) {
                case "depositInput":
                    $("#amtToDeposit").text(amt)
                    break;
                case "withdrawInput":
                    let poolBalance = parseFloat(web3.utils.fromWei(Contract.balance)) - parseFloat(web3.utils.fromWei(Contract.dripPool))
                    let amtToSend = (parseFloat(web3.utils.fromWei(User.Stake.sToken)) * poolBalance * amt) / (parseFloat(web3.utils.fromWei(User.Stake.balance)) * parseFloat(web3.utils.fromWei(Contract.sTokenTotal)) )
                    $("#amtToWithdraw").text(toFixed(amtToSend,2)) 
                    break;
            }
        }
    })
    
    $("#emissionRateInput").on("input", function() {
        let val = parseFloat($(this).val())
        if(val > 0) {
            $("#adjustedEmissionRate").show()
            $("#newEmissionRate").text(val)
            let valinWei = parseInt( (parseFloat(web3.utils.toWei(val.toString())) / 950400).toString() ) // 11 days is 950400 seconds
            newEmissionRate = valinWei
        } else {
            $("#adjustedEmissionRate").hide()
        }
    })
    
    $(".deposit").on("click", "#enableToken", function() {
        enableToken()
        click.play()
    })
    
    $(".deposit").on("click", "#depositToken", function() {
        let value = parseFloat($("#depositInput").val())
        if(value > 0) {
            if(value <= parseFloat(User.balance)) {
                depositToken(web3.utils.toWei(value.toString()))
                click.play()
            }
            else {
                $(".deposit").addClass("shake")
                setTimeout(function(){$(".deposit").removeClass("shake")}, 300)
                error.play()
            }
        } else {
            $(".deposit").addClass("shake")
            setTimeout(function(){$(".deposit").removeClass("shake")}, 300)
            error.play()
        }
    })
    
    $(".withdraw").on("click", "#withdrawToken", function() {
        let value = parseFloat($("#withdrawInput").val())
        if(value > 0) {
            let available = parseFloat(web3.utils.fromWei(User.Stake.balance)) - parseFloat(web3.utils.fromWei(User.Stake.commitAmount))
            if(value <= available) {
                withdrawToken(web3.utils.toWei(value.toString()))
                click.play()
            } else {
                $(".withdraw").addClass("shake")
                setTimeout(function(){$(".withdraw").removeClass("shake")}, 300)
                error.play()
            }
        } else {
            $(".withdraw").addClass("shake")
            setTimeout(function(){$(".withdraw").removeClass("shake")}, 300)
            error.play()
        }
    })
    
    $("#stakeOption").on("change", function() {
        User.option = this.value
    })
    
    $(".extended").on("click", "#extendedStake", function() {
        let value = parseFloat($("#extendedStakeInput").val())
        if(value > 0) {
            let available = parseFloat(web3.utils.fromWei(User.Stake.balance)) - parseFloat(web3.utils.fromWei(User.Stake.commitAmount))
            if(value <= available && User.option <= "2") {
                extendedStake(web3.utils.toWei(value.toString()), User.option)
                click.play()
            } else {
                $(".extended").addClass("shake")
                setTimeout(function(){$(".extended").removeClass("shake")}, 300)
                error.play()
            }
        } else {
            $(".extended").addClass("shake")
            setTimeout(function(){$(".extended").removeClass("shake")}, 300)
            error.play()
        }
    })
    
    $(".activestakes").on("click", ".unlock", function() {
        let stake = $(this).attr("data")
        if(stake <= User.ActiveStakes.length) {
            claimStake(stake)
            click.play()
        } else {
            $(".activestakes").addClass("shake")
            setTimeout(function(){$(".activestakes").removeClass("shake")}, 300)
            error.play()
        }
    })
    
    $(".withdraw").on("click", "#claimDrip", function() {
        if(User.dripRewards > 0) {
            claimDrip()
            click.play()
        }
    })
    
    $(".adminpanel").on("click", ".close", function() {
        $(".adminpanel").hide()
        click.play()
    })
    
    $(".adminpanel").on("click", "#adminDepositToken", function() {
        let value = parseFloat($("#adminDepositInput").val())
        if(value > 0) {
            if(value <= parseFloat(User.balance)) {
                adminDepositToken(web3.utils.toWei(value.toString()))
                click.play()
            }
            else {
                $(".adminpanel").addClass("shake")
                setTimeout(function(){$(".adminpanel").removeClass("shake")}, 300)
                error.play()
            }
        } else {
            $(".adminpanel").addClass("shake")
            setTimeout(function(){$(".adminpanel").removeClass("shake")}, 300)
            error.play()
        }
    })
    
    $(".adminpanel").on("click", "#changeEmissionRate", function() {
        let value = newEmissionRate
        console.log(newEmissionRate)
        if(value > 0) {
            changeEmissionRate(value.toString())
            click.play()
        } else {
            $(".adminpanel").addClass("shake")
            setTimeout(function(){$(".adminpanel").removeClass("shake")}, 300)
            error.play()
        }
    })
})

async function connect() {
    try {
        if (window.ethereum) {
            await ethereum.request({method: 'eth_requestAccounts'})
            web3 = new Web3(ethereum)
            await setup()
            window.ethereum.on("accountsChanged", (accounts) => {setup()})
            window.ethereum.on('networkChanged', function(networkId) {location.reload();})
        } else {
            // Non-dapp browser detected
            alert("Non-dapp browser detected. Please install MetaMask!")
        }
    }
    catch(e) {
        console.error(e)
    }
}

async function setup() {
    try {
        window.localStorage.setItem("connected", true)
        accounts = await web3.eth.getAccounts()
        User.address = accounts[0]
        if(User.address.toLowerCase() == adminAddress.toLowerCase()) {
            $(".adminpanel").css({
                "display":"flex"
            })
        }
        $("#Wallet").empty()
        $("#Wallet").html('<div class="blockie-border"><div class="blockie"></div></div><div class="flex col"><div>Balance</div><div class="flex"><div class="erc20Balance label-small"></div><div class="coin label-small leftright5px"></div></div></div>')
        let blockie = blockies.create({seed:accounts[0].toLowerCase()}).toDataURL()
        $(".blockie").css("background-image", "url("+blockie+")")
        
        let chainID = await web3.eth.getChainId()
        if(chainID == 1) {
            path = "https://etherscan.io/tx/"
            loadSPI()
            refresh($(".coin"), "$SPI")
            notify("connect", "Ethereum MainNet", "Wallet connected!", "mainnet")
        }
        else if(chainID == 56) {
            path = "https://www.bscscan.com/tx/"
            stakingContract = stakingContractOnBinanceChain
            SPIContract = GSPIContract
            loadSPI()
            refresh($(".coin"), "$GSPI")
            notify("connect", "Binance Smart Chain", "Wallet connected!", "binance")
        }
        else if(chainID == 3) {
            path = "https://ropsten.etherscan.io/tx/"
            loadSPI()
            refresh($(".coin"), "$SPI")
            notify("connect", "Ropsten Testnet", "Wallet connected!", "mainnet")
        }
    }
    catch(e) {
        console.error(e)
    }
}

async function loadSPI() {
    try {
        Token = new web3.eth.Contract(erc20ABI, SPIContract)
        Stake = new web3.eth.Contract(stakingABI, stakingContract)
        
        
        await fetchTokenData()
        fetchTokenLoop = setInterval(fetchTokenData, 2000)
        
        await fetchStakingData()
        fetchStakingLoop = setInterval(fetchStakingData, 2000)
        
        await fetchActiveStakes()
        
        showPanel()
    }
    catch(e) {
        console.error(e)
    }
}

async function fetchActiveStakes() {
    try {
        User.ActiveStakes = []
        await Stake.methods.stakesOf(User.address).call().then(function(r) {
            User.ActiveStakes = r
            updateStakesList()
            if(User.ActiveStakes.length > 0) {
                updateStakesListLoop = setInterval(updateStakesList, 1000)
            } else {
                clearInterval(updateStakesListLoop)
                updateStakesListLoop = null
            }
        })
    }
    catch(e) {
        console.error(e)
    }
}

async function fetchStakingData() {
    try {
        await Stake.methods.provider(User.address).call().then(function(r) {
            if(User.Stake.balance !== r.balance || User.Stake.commitAmount !== r.commitAmount) {
                let available = parseFloat(web3.utils.fromWei(r.balance)) - parseFloat(web3.utils.fromWei(r.commitAmount))
                refresh($(".availableDepositBalance"), toFixed(available, 2))
                User.Stake = r
            }
        })
        
        if(User.Stake.balance > 0) {
            await Stake.methods.dripBalance().call().then(function(r) {
                if(User.dripRewards != r) {
                    User.dripRewards = r
                    $("#dripRewardsMsg").html('Your dripped rewards: '+web3.utils.fromWei(r)+' [ <span id="claimDrip">claim</span> ]')
                }
                else {
                    $("#dripRewardsMsg").text("No drip rewards...")
                }
            })
        }
        
        if(User.address.toLowerCase() == adminAddress.toLowerCase()) {
            await Stake.methods.emissionRate().call().then(function(r) {
                if(emissionRate != r) {
                    emissionRate = r
                    refresh($(".currentEmissionRate"), emissionRate)
                    let in11Days = parseFloat(web3.utils.fromWei(emissionRate)) * 950400
                    refresh($(".per11Days"), toFixed(in11Days, 6))
                }
            })
        }
		
        await Stake.methods.sTokenTotal().call().then(function(r) {
            if(Contract.sTokenTotal != r) {
                Contract.sTokenTotal = r
            }
            if(Contract.sTokenTotal > 0) {
                let poolBalance = parseFloat(web3.utils.fromWei(Contract.balance)) - parseFloat(web3.utils.fromWei(Contract.dripPool))
                let dividends = poolBalance * parseFloat(web3.utils.fromWei(User.Stake.sToken)) / web3.utils.fromWei(Contract.sTokenTotal)
                if(dividends > 0) {
                    $("#dividendsMsg").html("<span>Your dividends: </span><span>"+toFixed(dividends, 6)+"</span>")
                } else {
                    $("#dividendsMsg").text("No dividends...")
                }
            }
            if(User.Stake.balance > 0) {
                let percent = parseFloat(web3.utils.fromWei(User.Stake.balance)) * 100 / parseFloat(web3.utils.fromWei(Contract.sTokenTotal))
                $(".percentInPool").text(toFixed(percent * 100000, 2))
            }
        })
        
        Contract.dripPool = await Stake.methods.dripPool().call()
    }
    catch(e) {
        console.error(e)
    }
}

async function fetchTokenData() {
    try {
        await Token.methods.allowance(User.address, stakingContract).call().then(function(r) {
            if(r > 0) {
                User.allowed = true
                $(".allowanceInput").css({
                    "display" : "none"
                })
                $(".depositInput").css({
                    "display" : "flex",
                    "flex-direction" : "column"
                })
                $(".withdraw, .extended, .activestakes").removeClass("disabled")
            } else {
                User.allowed = false
                $(".allowanceInput").css({
                    "display" : "flex",
                    "flex-direction" : "column"
                })
                $(".depositInput").css({
                    "display" : "none"
                })
                $(".withdraw, .extended, .activestakes").addClass("disabled")
            }
        })
        await Token.methods.balanceOf(User.address).call().then(function(r) {
            let balance = toFixed(web3.utils.fromWei(r), 2)
            if(User.balance !== balance) {
                User.balance = balance
                refresh($(".erc20Balance"), balance)
            }
        })
        await Token.methods.balanceOf(stakingContract).call().then(function(r) {
            if(Contract.balance !== r) {
                Contract.balance = r
                refresh($(".contractBalance"), toFixed(web3.utils.fromWei(Contract.balance), 4))
            }
        })
    }
    catch(e) {
        console.error(e)
    }
}

async function enableToken() {
    try {
        await Token.methods.approve(stakingContract, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({from: User.address})
        .on("transactionHash", function(hash) {
            notify("loading", "Approve token", "Pending...", hash)
        })
        .on("receipt", function(receipt) {
            notify("success", "Approve token", "Confirmed!", receipt.transactionHash)
            $(".allowanceInput").hide()
            $(".depositInput").show()
        })
    }
    catch(e) {
        console.error(e)
    }
}

async function depositToken(amount) {
    try {
        await Stake.methods.depositIntoPool(amount).send({from: User.address})
        .on("transactionHash", function(hash) {
            notify("loading", "Deposit to pool", "Pending...", hash)
        })
        .on("receipt", function(receipt) {
            notify("success", "Deposit to pool", "Confirmed!", receipt.transactionHash)
            $("#depositInput").val("")
            $("#amtToDeposit").text("0.00")
        })
    }
    catch(e) {
        console.error(e)
    }
}

async function withdrawToken(amount) {
    try {
        await Stake.methods.withdrawFromPool(amount).send({from: User.address})
        .on("transactionHash", function(hash) {
            notify("loading", "Withdraw from pool", "Pending...", hash)
        })
        .on("receipt", function(receipt) {
            notify("success", "Withdraw from pool", "Confirmed!", receipt.transactionHash)
            $("#withdrawInput").val("")
            $("#amtToWithdraw").text("0.00")
        })
    }
    catch(e) {
        console.error(e)
    }
}

async function extendedStake(amount, option) {
    try {
        await Stake.methods.extendedStake(amount, option).send({from: User.address})
        .on("transactionHash", function(hash) {
            notify("loading", "Extended stake", "Pending...", hash)
        })
        .on("receipt", function(receipt) {
            notify("success", "Extended stake", "Confirmed!", receipt.transactionHash)
            $("#extendedStakeInput").val("")
        })
        
        await fetchActiveStakes()
    }
    catch(e) {
        console.error(e)
    }
}

async function claimStake(stake) {
    try {
        await Stake.methods.claimStake(stake).send({from: User.address})
        .on("transactionHash", function(hash) {
            notify("loading", "Unlock stake", "Pending...", hash)
        })
        .on("receipt", function(receipt) {
            notify("success", "Unlock stake", "Confirmed!", receipt.transactionHash)
        })
        
        await fetchActiveStakes()
    }
    catch(e) {
        console.error(e)
    }
}

async function claimDrip() {
    try {
        await Stake.methods.claimDrip().send({from: User.address})
        .on("transactionHash", function(hash) {
            notify("loading", "Claim drip", "Pending...", hash)
        })
        .on("receipt", function(receipt) {
            notify("success", "Claim drip", "Confirmed!", receipt.transactionHash)
        })
    }
    catch(e) {
        console.error(e)
    }
}

async function adminDepositToken(value) {
    try {
        await Stake.methods.airdrop(value).send({from: User.address})
        .on("transactionHash", function(hash) {
            notify("loading", "Airdrop", "Pending...", hash)
        })
        .on("receipt", function(receipt) {
            notify("success", "Airdrop", "Confirmed!", receipt.transactionHash)
        })
    }
    catch(e) {
        console.error(e)
    }
}

async function changeEmissionRate(value) {
    try {
        await Stake.methods.changeEmissionRate(value).send({from: User.address})
        .on("transactionHash", function(hash) {
            notify("loading", "Change emissionRate", "Pending...", hash)
        })
        .on("receipt", function(receipt) {
            notify("success", "Change emissionRate", "Confirmed!", receipt.transactionHash)
            $("#emissionRateInput").val("")
            $("#adjustedEmissionRate").hide()
        })
    }
    catch(e) {
        console.error(e)
    }
}

let stakeCounter = 0
function updateStakesList() {
    $("#activeStakesList tbody").empty()
    
    if(User.ActiveStakes.length > 0) {
        $("#activeStakesTitle").text("")
    } else {
        $("#activeStakesTitle").text("No active stakes found")
    }
    
    for(let i = 0; i < User.ActiveStakes.length; i++) {
        if(User.ActiveStakes[i][0] > 0) {
            stakeCounter++
            let timestamp = Math.floor(new Date().getTime() / 1000)
            let unlockEpoch = User.ActiveStakes[i][1]
            if((unlockEpoch - timestamp) <= 0) {
                unlockEpoch = "Ready!"
            } else {
                unlockEpoch = (unlockEpoch - timestamp).toHHMMSS()
            }
            let stake = '<tr><td>'+toFixed(web3.utils.fromWei(User.ActiveStakes[i][0]), 2)+'</td><td>'+User.ActiveStakes[i][2]+'%</td><td>'+unlockEpoch+'</td><td><button class="unlock" data="'+i+'">Unlock</button></td></tr>'
            $("#activeStakesList tbody").append(stake)
        }
    }
    
    if(stakeCounter == 0) {
        $("#activeStakesTitle").text("No active stakes found")
    }
}

function notify(type, func, message, hash) {
    let icon, link
    switch(type) {
        case "loading":
            icon = '<i class="fas fa-spinner fa-spin"></i>'
            link = '<a href="'+path+hash+'" target="_blank"><i class="fas fa-external-link-alt"></i></a>'
            break;
        case "success":
            notif.play()
            icon = '<i class="far fa-check-circle"></i>'
            link = '<a href="'+path+hash+'" target="_blank"><i class="fas fa-external-link-alt"></i></a>'
            break;
        case "connect":
            icon = '<i class="far fa-check-circle"></i>'
            link = ''
            break;
    }
    let notification = '<div class="notification" data="'+hash+'"><div class="loading-icon-wrapper">'+icon+'</div><div class="flex col"><h3>'+func+'</h3><span class="label-small">'+message+' '+link+'</span></div></div>'
    $(".notifications").append(notification)
    setTimeout(function() {
        $('.notification[data='+hash+']').fadeOut()
    }, 5000)
}

function refresh(element, content) {
    $(element).hide()
    $(element).text(content)
    $(element).fadeIn()
}

function showPanel() {
    $(".connectwallet").hide()
    $(".panel").css("opacity", "1")
}

// https://stackoverflow.com/a/11818658
function toFixed(num, fixed) {
    var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?')
    return num.toString().match(re)[0]
}

Number.prototype.toHHMMSS = function() {
    var sec_num = parseInt(this, 10);
    var days = Math.floor(sec_num / 86400);
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - hours * 3600) / 60);
    var seconds = sec_num - hours * 3600 - minutes * 60;
    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    return days + ":" + hours + ":" + minutes;
}