// types.d.ts
declare module "types" {
    export type Item = {
        item: string;
        cost: number;
    }
    
    export type Friend = {
        username: string;
        items: Item[];
        amount: number;
        isSelected: boolean;
    }
}