// print
// encontrar a maior arvore balanceada 'dentro' da arvore
// verrficar o que é o node (leaf, um filho, dois filhos)   DONE
// qunatidade de nos folha de um nó   DONE
// count de nós  DONE
// min max DONE
// verficiar validade da arvore ('todos os nós a esquerda são menores a direita são maiores') DONE
// sucessor DONE
// height DONE
// using cached inOrderTraverse result ?
// DECIDE IF ROOT CAN BE DELETED
// FAZER TESTES DE TUDO
// incluir generator function ?

// fazer o print da arvoer e depois ir para o p5.js
// arrumar map, filter e reduce

// https://www.freecodecamp.org/news/binary-search-tree-traversal-inorder-preorder-post-order-for-bst/
// assertion typescript ? --> console.assertion ou criar própria fn: https://stackoverflow.com/questions/15313418/what-is-assert-in-javascript

type NodeType<T extends {}> = {
	element: T;
	left: NodeType<T> | null;
	right: NodeType<T> | null;
	parent: NodeType<T> | null;
};

type CompareFnReturnType = -1 | 0 | 1;
type CompareFnType<T extends {}> = (leftElement: T, rightElement: T) => CompareFnReturnType;

type OrderType = "Inorder" | "Preorder" | "Postorder";
type NodeKindType = "Leaf" | "OneChild" | "TwoChildren";
type NodeKindFn<T extends {}> = (node: NodeType<T>) => boolean;

type MapFnType<T> = (element: T, index?: number) => any;
type FilterFnType<T> = (element: T, index?: number) => boolean;
type ForEachFnType<T> = (element: T, index?: number) => void;
type NodeForEachFnType<T extends {}> = (node: NodeType<T>, index?: number) => void;
type ReduceFnType<T> = (acc: any, element: T, index?: number) => any;

// {} allows all types except undefined and null
const binaryTree = <T extends {}>(rootElement: T, compareFn?: CompareFnType<T>) => {
	if ((typeof rootElement === "object" && !compareFn) || typeof rootElement === "function")
		throw new Error("Unable to sort tree.");

	const createNode = (element: T, parent: NodeType<T> | null = null): NodeType<T> => {
		return { element, left: null, right: null, parent };
	};

	compareFn ??= (firstValue, secondValue) => (firstValue === secondValue ? 0 : firstValue > secondValue ? 1 : -1);
	const root: NodeType<T> = createNode(rootElement);

	const isLeaf: NodeKindFn<T> = (node: NodeType<T>) => !node.left && !node.right;
	// const isLeaf = (node: NodeType<T>) => !(node.left || node.right);

	const hasTwoChildren: NodeKindFn<T> = (node: NodeType<T>) => (node.left && node.right ? true : false);

	const hasOnlyOneChild: NodeKindFn<T> = (node: NodeType<T>) => !isLeaf(node) && !hasTwoChildren(node);
	// (!node.left && node.right) || (node.left && !node.right);

	const nodeHeight = (rootNode: NodeType<T> | null = root, height = 0): number => {
		if (!rootNode) return height;
		const leftHeight = nodeHeight(rootNode.left, height + 1);
		const rightHeight = nodeHeight(rootNode.right, height + 1);
		return Math.max(leftHeight, rightHeight);
	};

	const validate = (rootNode: NodeType<T> | null = root): boolean => {
		if (!rootNode) return true;
		if (rootNode.left && rootNode.left.element >= rootNode.element) return false;
		else if (rootNode.right && rootNode.right.element <= rootNode.element) return false;
		return true && validate(rootNode.left) && validate(rootNode.right);
	};

	const addNode = (element: T, node: NodeType<T> = root) => {
		if (element === node.element) return;
		if (compareFn!(element, node.element) === -1)
			node.left ? addNode(element, node.left) : (node.left = createNode(element, node));
		else if (compareFn!(element, node.element) === 1)
			node.right ? addNode(element, node.right) : (node.right = createNode(element, node));
	};

	const rightMostElement = (node: NodeType<T> = root): T => {
		if (isLeaf(node) || !node.right) return node.element;
		return rightMostElement(node.right);
	};

	const leftMostElement = (node: NodeType<T> = root) => {
		if (isLeaf(node) || !node.left) return node.element;
		return leftMostElement(node.left);
	};

	const ancestralReplacer = (node: NodeType<T>): NodeType<T> | false => {
		if (node.parent && node.parent.left === node) return node.parent;
		else if (node.parent) return ancestralReplacer(node.parent);
		return false;
	};

	const inOrderReplacer = (node: NodeType<T>): NodeType<T> | false => {
		if (node.right) {
			node = node.right;
			while (node.left) node = node.left;
			return node;
		} else {
			if (!node.parent) return false;
			return ancestralReplacer(node);
		}
	};

	const deleteLeafNode = (element: T, parent: NodeType<T> | null) => {
		if (!parent) throw new Error("Root deletion not allowed.");
		parent.left?.element === element ? (parent.left = null) : (parent.right = null);
	};

	const deleteNodeWithOneChild = (node: NodeType<T>, parent: NodeType<T> | null) => {
		const replacerNode = node.left ? node.left : node.right;
		if (!parent) root.element = replacerNode!.element;
		else {
			replacerNode!.parent = parent;
			parent.left?.element === node.element ? (parent.left = replacerNode) : (parent.right = replacerNode);
		}
	};

	const deleteNodeWithTwoChildren = (node: NodeType<T>, parent: NodeType<T> | null) => {
		const replacer = inOrderReplacer(node);
		if (!replacer) throw new Error("Node with two children without parent.");
		deleteNode(replacer.element);
		if (!parent) root.element = replacer.element;
		else parent.left === node ? (parent.left.element = replacer.element) : (parent.right!.element = replacer.element);
	};

	const deleteNode = (element: T, node: NodeType<T> | null = root): boolean => {
		if (element === root.element && isLeaf(root)) throw new Error("Root deletion not allowed.");
		if (!node) return false;

		if (node.element === element) {
			if (!node.parent && node !== root) throw new Error(`Can not delete node with no parent.`);
			if (isLeaf(node)) deleteLeafNode(element, node.parent);
			else if (hasTwoChildren(node)) deleteNodeWithTwoChildren(node, node.parent);
			else deleteNodeWithOneChild(node, node.parent);
			return true;
		}
		if (compareFn!(element, node.element) === -1) return deleteNode(element, node.left);
		else if (compareFn!(element, node.element) === 1) return deleteNode(element, node.right);
		return false;
	};

	const visit = (node: NodeType<T> | null = root, order: OrderType = "Inorder"): NodeType<T>[] => {
		if (!node) return [];
		const leftChildVisitResult = visit(node.left, order);
		const rightChildVisitResult = visit(node.right, order);
		switch (order) {
			case "Inorder":
				return [...leftChildVisitResult, node, ...rightChildVisitResult];
			case "Preorder":
				return [node, ...leftChildVisitResult, ...rightChildVisitResult];
			case "Postorder":
				return [...leftChildVisitResult, ...rightChildVisitResult, node];
			default:
				const _exhaustiveCheck: never = order;
				throw new Error("Unknown order.");
		}
	};

	const recursiveMap = ([currentNode, ...rest]: NodeType<T>[], fn: MapFnType<T>, index = 0): ReturnType<typeof fn>[] => {
		if (!currentNode) return [];

		return [fn(currentNode.element, index), ...recursiveMap(rest, fn, index + 1)];
	};

	const recursiveFilter = ([currentNode, ...rest]: NodeType<T>[], fn: FilterFnType<T>, index = 0): T[] => {
		if (!currentNode) return [];
		const fnResult = fn(currentNode.element, index) ? [currentNode.element] : [];
		return [...fnResult, ...recursiveFilter(rest, fn, index + 1)];
	};

	const recursiveReduce = (array: NodeType<T>[], fn: ReduceFnType<T>, acc: any = undefined, index = 0): ReturnType<typeof fn> => {
		if (array.length === 0) return acc;
		if (acc === undefined) [acc.element, ...array] = array;
		return recursiveReduce(array.slice(1), fn, fn(acc, array[0].element, index + 1), index + 1);
	};

	const map = (mapFn: MapFnType<T>, rootNode: NodeType<T> = root, order: OrderType = "Inorder"): ReturnType<typeof mapFn>[] => {
		const orderedNodes = visit(rootNode, order);
		return recursiveMap(orderedNodes, mapFn);
	};

	const filter = (filterFn: FilterFnType<T>, rootNode: NodeType<T> = root, order: OrderType = "Inorder"): T[] => {
		const orderedNodes = visit(rootNode, order);
		return recursiveFilter(orderedNodes, filterFn);
	};

	const reduce = (
		fn: ReduceFnType<T>,
		acc: any = undefined,
		rootNode: NodeType<T> = root,
		order: OrderType = "Inorder"
	): ReturnType<typeof fn> => {
		const orderedNodes = visit(rootNode, order);
		return recursiveReduce(orderedNodes, fn, acc);
	};

	const forEach = (fn: ForEachFnType<T>, rootNode: NodeType<T> = root, order: OrderType = "Inorder"): void => {
		const orderedNodes = visit(rootNode, order);
		for (let [index, node] of orderedNodes.entries()) fn(node.element, index);
	};

	const nodeForEach = (fn: NodeForEachFnType<T>, rootNode: NodeType<T> = root, order: OrderType = "Inorder"): void => {
		const orderedNodes = visit(rootNode, order);
		for (let [index, node] of orderedNodes.entries()) fn(node, index);
	};

	const nodeCount = (node: NodeType<T> = root, kind?: NodeKindType): number => {
		if (!kind) return visit(node).length;
		let kindCheckFn: NodeKindFn<T>;
		switch (kind) {
			case "Leaf":
				kindCheckFn = isLeaf;
				break;
			case "OneChild":
				kindCheckFn = hasOnlyOneChild;
				break;
			case "TwoChildren":
				kindCheckFn = hasTwoChildren;
				break;
			default:
				const _exhaustiveCheck: never = kind;
				throw new Error("Unknown node kind.");
		}
		let count = 0;
		nodeForEach(node => {
			if (kindCheckFn(node)) count++;
		});
		return count;
	};

	const searchNode = (value: T, node: NodeType<T> = root): NodeType<T> | false => {
		const comparison = compareFn!(value, node.element);
		if (comparison === 0) return node;
		if (comparison === -1 && node.left) return searchNode(value, node.left);
		if (comparison === 1 && node.right) return searchNode(value, node.right);
		return false;
	};

	const min = (node: NodeType<T> = root): T => leftMostElement(node);

	const max = (node: NodeType<T> = root): T => rightMostElement(node);

	const traverse = (order: OrderType = "Inorder", rootNode: NodeType<T> = root) => map(element => element, rootNode, order);

	const add = (element: T) => addNode(element);
	const remove = (element: T) => deleteNode(element);
	const search = (element: T) => (searchNode(element) ? true : false);
	const height = (rootNode: NodeType<T> = root) => nodeHeight(rootNode);

	function getCol(h: number): number {
		return 2 ** h - 1;
	}

	function printTree(M: any, root: NodeType<T> | null, col: number, row: number, height: number): any {
		if (root === null) {
			return;
		}
		M[row][col] = isLeaf(root)
			? root.element
			: hasTwoChildren(root)
			? `\u2BB6${root.element}\u2BB7`
			: root.left
			? `\u2BB6${root.element}`
			: `${root.element}\u2BB7`;
		printTree(M, root.left, col - Math.pow(2, height - 2), row + 1, height - 1);
		printTree(M, root.right, col + Math.pow(2, height - 2), row + 1, height - 1);
	}

	return {
		getCol,
		printTree,
		root,
		add,
		traverse,
		search,
		remove,
		map,
		filter,
		forEach,
		reduce,
		min,
		max,
		inOrderSuccessor: inOrderReplacer,
		validate,
		height,
		createNode,
		inOrderReplacer,
		ancestralReplacer,
		hasTwoChildren,
		isLeaf,
		hasOnlyOneChild,
		nodeHeight,
	};
};

export { binaryTree };

const tree = binaryTree(10);
tree.add(5);
tree.add(1);
tree.add(7);
tree.add(6);
tree.add(8);
tree.add(9);
tree.add(15);
tree.add(13);
tree.add(12);
tree.add(11);
tree.add(17);

// const h = tree.height(tree.root);
// const col = tree.getCol(h);
// console.log(`cols: ${col}`);
// const M = new Array(h).fill(0).map(() => new Array(col).fill(0));
// tree.printTree(M, tree.root, Math.floor(col / 2), 0, h);

// for (let i = 0; i < M.length; i++) {
// 	let row = "";
// 	for (let j = 0; j < M[i].length; j++) {
// 		if (M[i][j] === 0) {
// 			row = row + " ";
// 		} else {
// 			row = row + M[i][j] + " ";
// 		}
// 	}
// 	console.log(row);
// }

// // console.log(tree.validate(tree.root.right!));
// tree.remove(10);
// console.log(tree.traverse());
