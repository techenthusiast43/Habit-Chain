const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("HabitChain Smart Contract", function () {
  let habitChain;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const HabitChainFactory = await ethers.getContractFactory("HabitChain");
    habitChain = await HabitChainFactory.deploy();
    await habitChain.waitForDeployment();
  });

  describe("Habit Creation", function () {
    it("should allow a user to create a habit and emit HabitCreated event", async function () {
      const tx = await habitChain.connect(user1).createHabit("Daily Coding");
      await expect(tx)
        .to.emit(habitChain, "HabitCreated")
        .withArgs(1, user1.address, "Daily Coding", await time.latest());

      const habits = await habitChain.connect(user1).getMyHabits();
      expect(habits.length).to.equal(1);
      expect(habits[0].id).to.equal(1);
      expect(habits[0].name).to.equal("Daily Coding");
      expect(habits[0].owner).to.equal(user1.address);
      expect(habits[0].active).to.be.true;
      expect(habits[0].deleted).to.be.false;
      expect(habits[0].totalCompletions).to.equal(0);
    });

    it("should reject creating a habit with an empty name", async function () {
      await expect(habitChain.connect(user1).createHabit(""))
        .to.be.revertedWith("HabitChain: Habit name cannot be empty");
    });

    it("should isolate habits belonging to different users", async function () {
      await habitChain.connect(user1).createHabit("User1 Habit");
      await habitChain.connect(user2).createHabit("User2 Habit");

      const user1Habits = await habitChain.connect(user1).getMyHabits();
      const user2Habits = await habitChain.connect(user2).getMyHabits();

      expect(user1Habits.length).to.equal(1);
      expect(user1Habits[0].name).to.equal("User1 Habit");
      expect(user2Habits.length).to.equal(1);
      expect(user2Habits[0].name).to.equal("User2 Habit");
    });
  });

  describe("Daily Check-in Mechanism", function () {
    beforeEach(async function () {
      await habitChain.connect(user1).createHabit("Morning Workout");
    });

    it("should allow owner to check in and record check-in history", async function () {
      const tx = await habitChain.connect(user1).checkIn(1);
      const currentTime = await time.latest();

      await expect(tx)
        .to.emit(habitChain, "HabitCheckedIn")
        .withArgs(1, user1.address, currentTime, 1);

      const hasCheckedIn = await habitChain.connect(user1).hasCheckedInToday(1);
      expect(hasCheckedIn).to.be.true;

      const history = await habitChain.connect(user1).getCheckInHistory(1);
      expect(history.length).to.equal(1);
      expect(history[0]).to.equal(currentTime);

      const habits = await habitChain.connect(user1).getMyHabits();
      expect(habits[0].totalCompletions).to.equal(1);
    });

    it("should prevent duplicate check-in on the same UTC day", async function () {
      await habitChain.connect(user1).checkIn(1);

      await expect(habitChain.connect(user1).checkIn(1))
        .to.be.revertedWith("HabitChain: Already checked in today");
    });

    it("should allow check-in again after 1 day passes", async function () {
      await habitChain.connect(user1).checkIn(1);

      // Fast forward 1 day (86400 seconds) + 1 second
      await time.increase(86401);

      const hasCheckedInNextDay = await habitChain.connect(user1).hasCheckedInToday(1);
      expect(hasCheckedInNextDay).to.be.false;

      await expect(habitChain.connect(user1).checkIn(1)).to.not.be.reverted;

      const history = await habitChain.connect(user1).getCheckInHistory(1);
      expect(history.length).to.equal(2);
    });

    it("should reject check-in from non-owner", async function () {
      await expect(habitChain.connect(user2).checkIn(1))
        .to.be.revertedWith("HabitChain: Caller is not the habit owner");
    });

    it("should reject check-in if habit is inactive", async function () {
      await habitChain.connect(user1).deactivateHabit(1);
      await expect(habitChain.connect(user1).checkIn(1))
        .to.be.revertedWith("HabitChain: Habit is currently inactive");
    });
  });

  describe("Habit Status Management", function () {
    beforeEach(async function () {
      await habitChain.connect(user1).createHabit("Read 20 pages");
    });

    it("should deactivate and reactivate a habit", async function () {
      // Deactivate
      await expect(habitChain.connect(user1).deactivateHabit(1))
        .to.emit(habitChain, "HabitDeactivated")
        .withArgs(1, user1.address);

      let habits = await habitChain.connect(user1).getMyHabits();
      expect(habits[0].active).to.be.false;

      // Reactivate
      await expect(habitChain.connect(user1).activateHabit(1))
        .to.emit(habitChain, "HabitActivated")
        .withArgs(1, user1.address);

      habits = await habitChain.connect(user1).getMyHabits();
      expect(habits[0].active).to.be.true;
    });

    it("should soft delete a habit and exclude from getMyHabits", async function () {
      await expect(habitChain.connect(user1).deleteHabit(1))
        .to.emit(habitChain, "HabitDeleted")
        .withArgs(1, user1.address);

      const habits = await habitChain.connect(user1).getMyHabits();
      expect(habits.length).to.equal(0);

      // Attempting to check in on deleted habit should revert
      await expect(habitChain.connect(user1).checkIn(1))
        .to.be.revertedWith("HabitChain: Habit has been deleted");
    });

    it("should prevent non-owners from modifying habit status", async function () {
      await expect(habitChain.connect(user2).deactivateHabit(1))
        .to.be.revertedWith("HabitChain: Caller is not the habit owner");

      await expect(habitChain.connect(user2).deleteHabit(1))
        .to.be.revertedWith("HabitChain: Caller is not the habit owner");
    });
  });
});

