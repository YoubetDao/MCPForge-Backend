// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title MCPServerSubscription
 * @dev 管理MCPServer按月订阅付费的智能合约
 */
contract MCPServerSubscription is Ownable, ReentrancyGuard, Pausable {
    
    // 订阅信息结构体
    struct Subscription {
        uint256 expiryTime;     // 订阅过期时间戳
        uint256 lastPayment;    // 最后一次付款时间
        bool isActive;          // 订阅是否激活
    }
    
    // 状态变量
    mapping(address => Subscription) public subscriptions;
    uint256 public monthlyPrice;           // 月费价格 (wei)
    address public treasuryAddress;        // 资金提取地址
    uint256 public constant MONTH_DURATION = 30 days; // 一个月的秒数
    
    // 统计数据
    uint256 public totalSubscribers;      // 总订阅用户数
    uint256 public totalRevenue;          // 总收入
    
    // 事件定义
    event SubscriptionPurchased(
        address indexed user, 
        uint256 amount, 
        uint256 expiryTime
    );
    
    event SubscriptionExtended(
        address indexed user, 
        uint256 amount, 
        uint256 newExpiryTime
    );
    
    event PriceUpdated(
        uint256 oldPrice, 
        uint256 newPrice
    );
    
    event TreasuryAddressUpdated(
        address oldAddress, 
        address newAddress
    );
    
    event FundsWithdrawn(
        address indexed to, 
        uint256 amount
    );
    
    // 修饰符
    modifier validAddress(address _addr) {
        require(_addr != address(0), "Invalid address");
        _;
    }
    
    modifier hasValidSubscription(address _user) {
        require(isSubscriptionValid(_user), "No valid subscription");
        _;
    }
    
    /**
     * @dev 构造函数
     * @param _monthlyPrice 初始月费价格 (wei)
     * @param _treasuryAddress 资金提取地址
     */
    constructor(
        uint256 _monthlyPrice,
        address _treasuryAddress
    ) validAddress(_treasuryAddress) {
        monthlyPrice = _monthlyPrice;
        treasuryAddress = _treasuryAddress;
    }
    
    /**
     * @dev 购买月度订阅
     */
    function purchaseSubscription() external payable nonReentrant whenNotPaused {
        require(msg.value >= monthlyPrice, "Insufficient payment");
        
        address user = msg.sender;
        uint256 currentTime = block.timestamp;
        
        // 计算新的过期时间
        uint256 newExpiryTime;
        if (subscriptions[user].expiryTime > currentTime) {
            // 如果当前订阅还未过期，延长订阅时间
            newExpiryTime = subscriptions[user].expiryTime + MONTH_DURATION;
            emit SubscriptionExtended(user, msg.value, newExpiryTime);
        } else {
            // 新订阅或已过期订阅
            newExpiryTime = currentTime + MONTH_DURATION;
            if (!subscriptions[user].isActive) {
                totalSubscribers++;
            }
            emit SubscriptionPurchased(user, msg.value, newExpiryTime);
        }
        
        // 更新订阅信息
        subscriptions[user] = Subscription({
            expiryTime: newExpiryTime,
            lastPayment: currentTime,
            isActive: true
        });
        
        // 更新统计数据
        totalRevenue += msg.value;
        
        // 退还多余的付款
        if (msg.value > monthlyPrice) {
            payable(user).transfer(msg.value - monthlyPrice);
        }
    }
    
    /**
     * @dev 检查用户订阅是否有效
     * @param _user 用户地址
     * @return 是否有有效订阅
     */
    function isSubscriptionValid(address _user) public view returns (bool) {
        Subscription memory sub = subscriptions[_user];
        return sub.isActive && sub.expiryTime > block.timestamp;
    }
    
    /**
     * @dev 获取用户订阅信息
     * @param _user 用户地址
     * @return expiryTime 过期时间
     * @return isValid 是否有效
     * @return remainingDays 剩余天数
     */
    function getSubscriptionInfo(address _user) 
        external 
        view 
        returns (
            uint256 expiryTime,
            bool isValid,
            uint256 remainingDays
        ) 
    {
        Subscription memory sub = subscriptions[_user];
        isValid = isSubscriptionValid(_user);
        expiryTime = sub.expiryTime;
        
        if (isValid && sub.expiryTime > block.timestamp) {
            remainingDays = (sub.expiryTime - block.timestamp) / 1 days;
        } else {
            remainingDays = 0;
        }
    }
    
    /**
     * @dev 批量检查用户订阅状态（用于后端验证）
     * @param _users 用户地址数组
     * @return 对应的订阅有效性数组
     */
    function batchCheckSubscriptions(address[] calldata _users) 
        external 
        view 
        returns (bool[] memory) 
    {
        bool[] memory results = new bool[](_users.length);
        for (uint256 i = 0; i < _users.length; i++) {
            results[i] = isSubscriptionValid(_users[i]);
        }
        return results;
    }
    
    // ============ 管理员功能 ============
    
    /**
     * @dev 设置月费价格
     * @param _newPrice 新的月费价格 (wei)
     */
    function setMonthlyPrice(uint256 _newPrice) external onlyOwner {
        require(_newPrice > 0, "Price must be greater than 0");
        uint256 oldPrice = monthlyPrice;
        monthlyPrice = _newPrice;
        emit PriceUpdated(oldPrice, _newPrice);
    }
    
    /**
     * @dev 设置资金提取地址
     * @param _newTreasuryAddress 新的资金提取地址
     */
    function setTreasuryAddress(address _newTreasuryAddress) 
        external 
        onlyOwner 
        validAddress(_newTreasuryAddress) 
    {
        address oldAddress = treasuryAddress;
        treasuryAddress = _newTreasuryAddress;
        emit TreasuryAddressUpdated(oldAddress, _newTreasuryAddress);
    }
    
    /**
     * @dev 提取合约中的资金
     * @param _amount 提取金额 (wei)，0表示提取全部
     */
    function withdrawFunds(uint256 _amount) external onlyOwner nonReentrant {
        uint256 contractBalance = address(this).balance;
        require(contractBalance > 0, "No funds to withdraw");
        
        uint256 withdrawAmount = _amount == 0 ? contractBalance : _amount;
        require(withdrawAmount <= contractBalance, "Insufficient contract balance");
        
        payable(treasuryAddress).transfer(withdrawAmount);
        emit FundsWithdrawn(treasuryAddress, withdrawAmount);
    }
    
    /**
     * @dev 紧急暂停合约
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev 恢复合约运行
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev 管理员强制设置用户订阅状态（紧急情况使用）
     * @param _user 用户地址
     * @param _expiryTime 过期时间
     * @param _isActive 是否激活
     */
    function adminSetSubscription(
        address _user,
        uint256 _expiryTime,
        bool _isActive
    ) external onlyOwner validAddress(_user) {
        bool wasActive = subscriptions[_user].isActive;
        
        subscriptions[_user] = Subscription({
            expiryTime: _expiryTime,
            lastPayment: block.timestamp,
            isActive: _isActive
        });
        
        // 更新订阅者计数
        if (!wasActive && _isActive) {
            totalSubscribers++;
        } else if (wasActive && !_isActive) {
            totalSubscribers--;
        }
    }
    
    // ============ 查询功能 ============
    
    /**
     * @dev 获取合约余额
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev 获取合约统计信息
     */
    function getContractStats() 
        external 
        view 
        returns (
            uint256 _totalSubscribers,
            uint256 _totalRevenue,
            uint256 _contractBalance,
            uint256 _monthlyPrice
        ) 
    {
        return (
            totalSubscribers,
            totalRevenue,
            address(this).balance,
            monthlyPrice
        );
    }
    
    /**
     * @dev 接收ETH的回退函数
     */
    receive() external payable {
        // 可以接收直接转账，但不会创建订阅
        totalRevenue += msg.value;
    }
}