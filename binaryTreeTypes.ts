export type ChildSideType = "left" | "right";
export type OrderType = "Inorder" | "Preorder" | "Postorder";
export type NodeKindType = "Leaf" | "OneChild" | "BothChildren";
export type RotationType = "LL" | "RR" | "LR" | "RL";

export type NodeType<T extends {}> = {
	element: T;
	left: NodeType<T> | null;
	right: NodeType<T> | null;
	parent: NodeType<T> | null;
	level: number; // depth
	levelPosition: number;
	parentSide: ChildSideType | null;
};

export type CompareFnReturnType = -1 | 0 | 1;
export type CompareFnType<T extends {}> = (leftElement: T, rightElement: T) => CompareFnReturnType;
export type MapFnType<T> = (element: T, index?: number) => any;
export type FilterFnType<T> = (element: T, index?: number) => boolean;
export type ForEachFnType<T> = (element: T, index?: number) => void;
export type NodeForEachFnType<T extends {}> = (node: NodeType<T>, index?: number) => void;
export type ReduceFnType<T> = (acc: any, element: T, index?: number) => any;

export type NodeKindFn<T extends {}> = (node: NodeType<T>) => boolean;
export type sortedNodesType<T extends {}> = {
	[level: string]: NodeType<T>[];
};
