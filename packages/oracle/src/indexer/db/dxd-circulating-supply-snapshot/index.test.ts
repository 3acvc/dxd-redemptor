import Decimal from "decimal.js-light";
import mongoose from "mongoose";
import {
    DXDCirculatingSupplySnapshotModel,
    getDXDCirculatingSupplyAtBlocks,
    updateDXDCirculatingSupplySnapshot,
} from ".";
import { ChainId } from "../../../constants";
import { BigNumber } from "@ethersproject/bignumber";
import { parseUnits } from "@ethersproject/units";

describe("dxd circulating supply snapshot handling", () => {
    beforeAll(async () => {
        mongoose.connection.on("error", (error) => {
            console.error(error);
            process.exit(100);
        });
        await mongoose.connect(global.__MONGO_URI__, {});
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe("update", () => {
        let blockNumber: number;
        let initialSupply: Decimal;

        beforeEach(async () => {
            blockNumber = 0;
            initialSupply = new Decimal("10");
            await new DXDCirculatingSupplySnapshotModel({
                blockNumber,
                chainId: ChainId.ETHEREUM,
                supply: initialSupply.toString(),
            }).save();
        });

        afterEach(async () => {
            await DXDCirculatingSupplySnapshotModel.deleteMany();
        });

        test("should do nothing when supply change is 0", async () => {
            expect(
                await DXDCirculatingSupplySnapshotModel.countDocuments()
            ).toBe(1);
            const preUpdateDocument =
                await DXDCirculatingSupplySnapshotModel.findOne();
            expect(preUpdateDocument).not.toBeNull();
            await updateDXDCirculatingSupplySnapshot(
                blockNumber + 1,
                BigNumber.from(0)
            );
            expect(
                await DXDCirculatingSupplySnapshotModel.countDocuments()
            ).toBe(1);
            const postUpdateDocument =
                await DXDCirculatingSupplySnapshotModel.findOne();
            expect(postUpdateDocument).not.toBeNull();
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(preUpdateDocument?.equals(postUpdateDocument!)).toBe(true);
        });

        test("should update instead of saving a new snapshot when multiple updates are performed in the same block (positive change)", async () => {
            expect(
                await DXDCirculatingSupplySnapshotModel.countDocuments()
            ).toBe(1);
            const preUpdateDocument =
                await DXDCirculatingSupplySnapshotModel.findOne();
            expect(preUpdateDocument).not.toBeNull();
            expect(preUpdateDocument?.supply).toBe(initialSupply.toString());
            // positive change
            const positiveChange = new Decimal("10");
            await updateDXDCirculatingSupplySnapshot(
                blockNumber,
                BigNumber.from(parseUnits(positiveChange.toString(), 18))
            );
            expect(
                await DXDCirculatingSupplySnapshotModel.countDocuments()
            ).toBe(1);
            const postUpdateDocument =
                await DXDCirculatingSupplySnapshotModel.findOne();
            expect(postUpdateDocument).not.toBeNull();
            expect(postUpdateDocument?.blockNumber).toBe(
                preUpdateDocument?.blockNumber
            );
            expect(postUpdateDocument?.supply).toBe(
                initialSupply.plus(positiveChange).toString()
            );
            // checks that an update has been performed
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(preUpdateDocument?.equals(postUpdateDocument!)).toBe(true);
        });

        test("should update instead of saving a new snapshot when multiple updates are performed in the same block (negative change)", async () => {
            expect(
                await DXDCirculatingSupplySnapshotModel.countDocuments()
            ).toBe(1);
            const preUpdateDocument =
                await DXDCirculatingSupplySnapshotModel.findOne();
            expect(preUpdateDocument).not.toBeNull();
            expect(preUpdateDocument?.supply).toBe(initialSupply.toString());
            // positive change
            const negativeChange = new Decimal("-2");
            await updateDXDCirculatingSupplySnapshot(
                blockNumber,
                BigNumber.from(parseUnits(negativeChange.toString(), 18))
            );
            expect(
                await DXDCirculatingSupplySnapshotModel.countDocuments()
            ).toBe(1);
            const postUpdateDocument =
                await DXDCirculatingSupplySnapshotModel.findOne();
            expect(postUpdateDocument).not.toBeNull();
            expect(postUpdateDocument?.blockNumber).toBe(
                preUpdateDocument?.blockNumber
            );
            expect(postUpdateDocument?.supply).toBe(
                // remember change is negative, hence we must use plus
                initialSupply.plus(negativeChange).toString()
            );
            // checks that an update has been performed
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(preUpdateDocument?.equals(postUpdateDocument!)).toBe(true);
        });

        test("should save a new snapshot when updates are performed across blocks (positive change)", async () => {
            expect(
                await DXDCirculatingSupplySnapshotModel.countDocuments()
            ).toBe(1);
            const preUpdateDocument =
                await DXDCirculatingSupplySnapshotModel.findOne();
            expect(preUpdateDocument).not.toBeNull();
            expect(preUpdateDocument?.supply).toBe(initialSupply.toString());
            // positive change
            const positiveChange = new Decimal("2");
            await updateDXDCirculatingSupplySnapshot(
                blockNumber + 1,
                BigNumber.from(parseUnits(positiveChange.toString(), 18))
            );
            expect(
                await DXDCirculatingSupplySnapshotModel.countDocuments()
            ).toBe(2);
            const postUpdateDocument =
                await DXDCirculatingSupplySnapshotModel.findOne().sort([
                    ["blockNumber", "desc"],
                ]);
            expect(postUpdateDocument).not.toBeNull();
            expect(postUpdateDocument?.blockNumber).not.toBe(
                preUpdateDocument?.blockNumber
            );
            expect(postUpdateDocument?.blockNumber).toBe(blockNumber + 1);
            expect(postUpdateDocument?.supply).toBe(
                initialSupply.plus(positiveChange).toString()
            );
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(preUpdateDocument?.equals(postUpdateDocument!)).toBe(false);
        });

        test("should save a new snapshot when updates are performed across blocks (negative change)", async () => {
            expect(
                await DXDCirculatingSupplySnapshotModel.countDocuments()
            ).toBe(1);
            const preUpdateDocument =
                await DXDCirculatingSupplySnapshotModel.findOne();
            expect(preUpdateDocument).not.toBeNull();
            expect(preUpdateDocument?.supply).toBe(initialSupply.toString());
            // positive change
            const negativeChange = new Decimal("-8");
            await updateDXDCirculatingSupplySnapshot(
                blockNumber + 1,
                BigNumber.from(parseUnits(negativeChange.toString(), 18))
            );
            expect(
                await DXDCirculatingSupplySnapshotModel.countDocuments()
            ).toBe(2);
            const postUpdateDocument =
                await DXDCirculatingSupplySnapshotModel.findOne().sort([
                    ["blockNumber", "desc"],
                ]);
            expect(postUpdateDocument).not.toBeNull();
            expect(postUpdateDocument?.blockNumber).not.toBe(
                preUpdateDocument?.blockNumber
            );
            expect(postUpdateDocument?.blockNumber).toBe(blockNumber + 1);
            expect(postUpdateDocument?.supply).toBe(
                initialSupply.plus(negativeChange).toString()
            );
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(preUpdateDocument?.equals(postUpdateDocument!)).toBe(false);
        });
    });

    describe("get supply at block", () => {
        beforeEach(async () => {
            // Supply is:
            // Ethereum: 10 at block 0, 20 at block 5, 13.5 at block 20 and 2 at block 22
            // Gnosis: 2 at block 0, 61 at block 18, 13.5 at block 22
            await new DXDCirculatingSupplySnapshotModel({
                blockNumber: 0,
                supply: "10",
            }).save();
            await new DXDCirculatingSupplySnapshotModel({
                blockNumber: 5,
                supply: "20",
            }).save();
            await new DXDCirculatingSupplySnapshotModel({
                blockNumber: 20,
                supply: "13.5",
            }).save();
            await new DXDCirculatingSupplySnapshotModel({
                blockNumber: 22,
                supply: "2",
            }).save();
        });

        afterEach(async () => {
            await DXDCirculatingSupplySnapshotModel.deleteMany();
        });

        test("should work when getting a snapshot", async () => {
            const supplyAtBlock = await getDXDCirculatingSupplyAtBlocks(2);
            // ethereum supply at given block: 10
            expect(supplyAtBlock.equals(new Decimal("10"))).toBe(true);
        });

        test("should work when getting a snapshot (blocks right on a new snapshot)", async () => {
            // this test just makes sure that we have the correct output when blocks
            // are right on snapshot changes
            const supplyAtBlocks = await getDXDCirculatingSupplyAtBlocks(5);
            // ethereum supply at given block: 20
            expect(supplyAtBlocks.eq(new Decimal("20"))).toBe(true);
        });

        test("should fail when trying to get a very old snapshot", async () => {
            await expect(getDXDCirculatingSupplyAtBlocks(-1)).rejects.toEqual(
                new Error("no snapshot present")
            );
        });
    });
});
