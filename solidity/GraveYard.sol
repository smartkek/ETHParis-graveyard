pragma solidity ^0.5.2;

interface IERC20 {
    function totalSupply() external returns (uint);

 function balanceOf(address who) external view returns (uint256);
 function transfer(address to, uint256 value) external returns (bool);
 function allowance(address owner, address spender) external view returns (uint256);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function approve(address spender, uint256 value) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
 event Approval(address indexed owner, address indexed spender, uint256 value);
}

interface IDeadTokens {
    function bury(IERC20 token) external;
    function buried(IERC20 token) external view returns (bool);
}

contract DeadTokens is IDeadTokens {
    mapping (address => uint) dead;

    event AskChainlink(address);

    function bury(IERC20 token) external {
        if (buried(token))  {
            // nice, it is ok!
        } else {
            // check at Chainlink
            emit AskChainlink(address(token));
        }
    }

    function buried(IERC20 token) public view returns (bool) {
        return dead[address(token)] > 0;
    }

    function chainlinkCallback(IERC20 token, bool listed) external {
        if (listed) {
            dead[address(token)] = now;
        }
    }
}



contract GraveYard {
    IDeadTokens dt;
    constructor(IDeadTokens _dt) public {
        dt = _dt;
    }

    modifier onlyBuried(IERC20 token) {
        require(dt.buried(token), "bury token first!");
        _;
    }



    event Burned(address indexed token, address indexed user, uint amount, string message);

    function burn(IERC20 token, string calldata message) external onlyBuried(token) {
        _burn(token, msg.sender, message);
    }
    function burn(IERC20 token, address user, string calldata message) external onlyBuried(token) {
        _burn(token, user, message);
    }


    function _burn(IERC20 token, address user, string memory message) internal {
        uint approved = token.allowance(user, address(this));
        uint balance = token.balanceOf(user);
        uint amount = approved < balance ? approved : balance;

        token.transferFrom(user, address(this), amount);

        emit Burned(address(token), user, amount, message);
    }

    function buy(IERC20 token) external payable onlyBuried(token) {
        // do some 0x magic
    }

    function sell(IERC20 token, uint amount) external payable onlyBuried(token) {
        // do some 0x magic
    }
}