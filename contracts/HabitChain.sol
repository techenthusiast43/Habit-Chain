// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title HabitChain
 * @notice Lightweight on-chain habit tracker deployed on the BOT Chain network.
 * @dev Tracks daily habits and prevents duplicate check-ins within the same UTC day.
 */
contract HabitChain {
    struct Habit {
        uint256 id;
        address owner;
        string name;
        bool active;
        bool deleted;
        uint256 createdAt;
        uint256 totalCompletions;
    }

    uint256 private _nextHabitId = 1;

    // habitId => Habit
    mapping(uint256 => Habit) public habits;

    // habitId => (dayIndex => bool) where dayIndex = timestamp / 1 days (86400 seconds)
    mapping(uint256 => mapping(uint256 => bool)) public hasCheckedInDay;

    // habitId => array of check-in timestamps
    mapping(uint256 => uint256[]) private _checkInHistory;

    // user address => list of habit IDs
    mapping(address => uint256[]) private _userHabits;

    // Events
    event HabitCreated(uint256 indexed habitId, address indexed owner, string name, uint256 createdAt);
    event HabitCheckedIn(uint256 indexed habitId, address indexed owner, uint256 timestamp, uint256 totalCompletions);
    event HabitDeactivated(uint256 indexed habitId, address indexed owner);
    event HabitActivated(uint256 indexed habitId, address indexed owner);
    event HabitDeleted(uint256 indexed habitId, address indexed owner);

    modifier onlyHabitOwner(uint256 habitId) {
        Habit storage habit = habits[habitId];
        require(habit.owner == msg.sender, "HabitChain: Caller is not the habit owner");
        require(!habit.deleted, "HabitChain: Habit has been deleted");
        _;
    }

    /**
     * @notice Creates a new habit for the caller.
     * @param name The habit name/description (cannot be empty).
     * @return habitId The auto-incremented ID of the newly created habit.
     */
    function createHabit(string calldata name) external returns (uint256) {
        require(bytes(name).length > 0, "HabitChain: Habit name cannot be empty");
        require(bytes(name).length <= 120, "HabitChain: Habit name is too long");

        uint256 habitId = _nextHabitId++;
        habits[habitId] = Habit({
            id: habitId,
            owner: msg.sender,
            name: name,
            active: true,
            deleted: false,
            createdAt: block.timestamp,
            totalCompletions: 0
        });

        _userHabits[msg.sender].push(habitId);

        emit HabitCreated(habitId, msg.sender, name, block.timestamp);
        return habitId;
    }

    /**
     * @notice Records a daily check-in for an active habit.
     * @dev Reverts if the habit is inactive or if the user already checked in today (UTC).
     * @param habitId The ID of the habit to check in.
     */
    function checkIn(uint256 habitId) external onlyHabitOwner(habitId) {
        Habit storage habit = habits[habitId];
        require(habit.active, "HabitChain: Habit is currently inactive");

        uint256 currentDay = block.timestamp / 1 days;
        require(!hasCheckedInDay[habitId][currentDay], "HabitChain: Already checked in today");

        hasCheckedInDay[habitId][currentDay] = true;
        _checkInHistory[habitId].push(block.timestamp);
        habit.totalCompletions += 1;

        emit HabitCheckedIn(habitId, msg.sender, block.timestamp, habit.totalCompletions);
    }

    /**
     * @notice Deactivates a habit to pause tracking.
     * @param habitId The ID of the habit to deactivate.
     */
    function deactivateHabit(uint256 habitId) external onlyHabitOwner(habitId) {
        Habit storage habit = habits[habitId];
        require(habit.active, "HabitChain: Habit is already inactive");
        habit.active = false;

        emit HabitDeactivated(habitId, msg.sender);
    }

    /**
     * @notice Activates a previously deactivated habit.
     * @param habitId The ID of the habit to activate.
     */
    function activateHabit(uint256 habitId) external onlyHabitOwner(habitId) {
        Habit storage habit = habits[habitId];
        require(!habit.active, "HabitChain: Habit is already active");
        habit.active = true;

        emit HabitActivated(habitId, msg.sender);
    }

    /**
     * @notice Soft-deletes a habit so it is excluded from active views.
     * @param habitId The ID of the habit to delete.
     */
    function deleteHabit(uint256 habitId) external onlyHabitOwner(habitId) {
        Habit storage habit = habits[habitId];
        habit.deleted = true;
        habit.active = false;

        emit HabitDeleted(habitId, msg.sender);
    }

    /**
     * @notice Returns all non-deleted habits created by the caller.
     */
    function getMyHabits() external view returns (Habit[] memory) {
        uint256[] storage allIds = _userHabits[msg.sender];
        uint256 nonDeletedCount = 0;

        for (uint256 i = 0; i < allIds.length; i++) {
            if (!habits[allIds[i]].deleted) {
                nonDeletedCount++;
            }
        }

        Habit[] memory result = new Habit[](nonDeletedCount);
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < allIds.length; i++) {
            uint256 id = allIds[i];
            if (!habits[id].deleted) {
                result[currentIndex] = habits[id];
                currentIndex++;
            }
        }

        return result;
    }

    /**
     * @notice Checks if the habit has been checked in for the current UTC day.
     * @param habitId The ID of the habit.
     */
    function hasCheckedInToday(uint256 habitId) external view returns (bool) {
        return hasCheckedInDay[habitId][block.timestamp / 1 days];
    }

    /**
     * @notice Returns the list of check-in timestamps for a specific habit.
     * @param habitId The ID of the habit.
     */
    function getCheckInHistory(uint256 habitId) external view returns (uint256[] memory) {
        require(habits[habitId].owner == msg.sender, "HabitChain: Caller is not the habit owner");
        return _checkInHistory[habitId];
    }
}

