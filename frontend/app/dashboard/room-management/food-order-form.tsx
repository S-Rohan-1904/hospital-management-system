"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRoomManagementContext } from "@/context/RoomManagementContext";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

interface OrderFoodFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: string | null;
}

export function OrderFoodForm({
  open,
  onOpenChange,
  room = null,
}: OrderFoodFormProps) {
  console.log(room);

  const { foodAvailable, orderFood } = useRoomManagementContext();
  const [orderList, setOrderList] = useState<
    { foodId: string; name: string; price: number; quantity: number }[]
  >([]);
  const [selectedFood, setSelectedFood] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const { toast } = useToast();

  const handleAddFood = () => {
    if (!selectedFood || quantity <= 0) {
      toast({
        title: "Error",
        description: "Please select a valid food item and quantity.",
        variant: "destructive",
      });
      return;
    }

    const foodItem = foodAvailable.find((item) => item._id === selectedFood);
    if (foodItem) {
      setOrderList((prev) => [
        ...prev,
        {
          foodId: foodItem._id,
          name: foodItem.foodItem,
          price: foodItem.price,
          quantity,
        },
      ]);
      setSelectedFood(null);
      setQuantity(1);
    }
  };

  const handleSubmitOrder = async () => {
    try {
      const orders = orderList.map((item) => ({
        email: room,
        foodId: item.foodId,
        quantity: item.quantity,
      }));
      await orderFood(orders);
      toast({
        title: "Success",
        description: "Food order placed successfully.",
        variant: "default",
      });
      setOrderList([]);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to place the food order. Please try again.",
        variant: "destructive",
      });
      console.error("Error placing order:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Order Food</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="food-item">Food Item</Label>
            <Select
              value={selectedFood || ""}
              onValueChange={(value) => setSelectedFood(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a food item" />
              </SelectTrigger>
              <SelectContent>
                {foodAvailable.map((food) => (
                  <SelectItem key={food._id} value={food._id}>
                    {food.foodItem} - ₹{food.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min={1}
              placeholder="Enter quantity"
            />
          </div>
          <Button
            onClick={handleAddFood}
            disabled={!selectedFood || quantity <= 0}
          >
            Add Food Item
          </Button>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Order List</h3>
            {orderList.length > 0 ? (
              <ul className="space-y-2">
                {orderList.map((item, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span>
                      {item.name} (x{item.quantity})
                    </span>
                    <span>₹{item.price * item.quantity}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">
                No items added to the order.
              </p>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="ghost"
              onClick={() => {
                setOrderList([]);
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitOrder}
              disabled={orderList.length === 0}
            >
              Place Order
            </Button>
          </div>
        </div>
      </DialogContent>
      <Toaster />
    </Dialog>
  );
}
