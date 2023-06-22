import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { User } from "../models/users";
import * as CustomErrors from "../errors";
import asyncWrapper from "../helpers/asyncWrapper";
import { httpResponse } from "../helpers";
// import { ObjectId } from 'mongoose';
import mongoose from "mongoose";



export const addcartController = asyncWrapper(
  async (_req: Request, _res: Response, _next: NextFunction) => {
    try {
      const {  itemId, cartType } = _req.params;
      // const {quantity} = _req.body
      const user = await User.findById(_req.user.userId);

      if (!user) {
        _res.status(StatusCodes.NOT_FOUND).json({ error: 'User not found' });
        return;
      }
            const existingItem = user.cart.find((item) => item.item?.toString() === itemId && item.cartType === cartType);

      if (existingItem) {
        _res.status(StatusCodes.BAD_REQUEST).json({ error: 'Item already exists in the cart' });
        return;
      }

      const itemIdIsValid =  mongoose.Types.ObjectId.isValid(itemId);
      if (!itemIdIsValid) {
        _res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid item ID' });
        return;
      }

      const item: { item: mongoose.Types.ObjectId; cartType: "Product" | "Service";quantity: number } = {
        item: new mongoose.Types.ObjectId(itemId),
        cartType: cartType as "Product" | "Service",
        quantity: _req.body.quantity || 1,
      };

      user.cart.push(item);
      await user.save();
      _res.json(user);
    } catch (error:any) {
      console.log('====================================');
      console.log(error.message);
      console.log('====================================');
      _res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Error adding item to cart' });
    }
  }
);


export const removeCartItem = asyncWrapper(
  async (_req: Request, _res: Response, _next: NextFunction) => {
    try {
      const { itemId, cartType } = _req.params;
      const user = await User.findById(_req.user.userId);

      if (!user) {
        _res.status(StatusCodes.NOT_FOUND).json({ error: "User not found" });
        return;
      }

      const existingItemIndex = user.cart.findIndex(
        (item) => item.item?.toString() === itemId && item.cartType === cartType
      );

      if (existingItemIndex === -1) {
        _res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: "Item not found in the cart" });
        return;
      }

      user.cart.splice(existingItemIndex, 1);
      await user.save();
      _res.json(user);
    } catch (error: any) {
      console.log("====================================");
      console.log(error.message);
      console.log("====================================");
      _res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Error removing item from cart" });
    }
  }
);
