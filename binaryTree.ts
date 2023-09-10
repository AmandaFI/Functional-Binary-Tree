// print
// verrficar o que é o node (leaf, um filho, dois filhos)
// qunatidade de nos folha de um nó
// count de nós
// min max
// encontrar a maior arvore balanceada 'dentro' da arvore
// verficiar validade da arvore ('todos os nós a esquerda são menores a direita são maiores')

type NodeType<T extends {}> = {
	element: T;
	left: NodeType<T> | null;
	right: NodeType<T> | null;
};

type CompareFnReturnType = -1 | 0 | 1;
type CompareFnType<T extends {}> = (el1: T, el2: T) => CompareFnReturnType;

// https://www.freecodecamp.org/news/binary-search-tree-traversal-inorder-preorder-post-order-for-bst/
type OrderType = "Inorder" | "Preorder" | "Postorder";
type MapFnType<T> = (element: T, index?: number) => any;
type FilterFnType<T> = (element: T, index?: number) => boolean;
type ForEachFnType<T> = (element: T, index?: number) => void;
type ReduceFnType<T> = (acc: any, element: T, index?: number) => any;

type SuccessorType<T extends {}> = {
	successor: NodeType<T>;
	successorParent: NodeType<T>;
};

// {} allows all types except undefined and null
const binaryTree = <T extends {}>(rootElement: T, compareFn?: CompareFnType<T>) => {
	if ((typeof rootElement === "object" && !compareFn) || typeof rootElement === "function")
		throw new Error("Unable to sort tree.");

	const createNode = (element: T): NodeType<T> => {
		return { element, left: null, right: null };
	};

	compareFn ??= (firstValue, secondValue) => (firstValue === secondValue ? 0 : firstValue > secondValue ? 1 : -1);
	let nodeCount = 0;
	const root: NodeType<T> = createNode(rootElement);

	// DECIDE IF ROOT CAN BE DELETED

	// assertion typescript ?
	const addNode = (element: T, node: NodeType<T> = root) => {
		// if (compareFn === undefined) throw new Error("compareFn must not be undefined.");
		if (element === node.element) return;
		else {
			if (compareFn!(element, node.element) === -1)
				node.left !== null ? addNode(element, node.left) : (node.left = createNode(element));
			else if (compareFn!(element, node.element) === 1)
				node.right !== null ? addNode(element, node.right) : (node.right = createNode(element));
		}
	};

	// reformar para retornar o sucessor em qualquer ordem e recebendo um node
	const inOrderSuccessor = (node: NodeType<T>, parent: NodeType<T>): SuccessorType<T> => {
		if (node.right === null && node.left === null) return { successor: node, successorParent: parent };

		return node.left !== null ? inOrderSuccessor(node.left, node) : inOrderSuccessor(node.right as NodeType<T>, node);
	};

	const isLeaf = (node: NodeType<T>) => [node.left, node.right].every(node => node === null);
	const hasTwoChildren = (node: NodeType<T>) => ![node.left, node.right].every(node => node === null);
	const hasOnlyOneChild = (node: NodeType<T>) =>
		(node.left !== null && node.right === null) || (node.left === null && node.right !== null);

	const deleteLeafNode = (value: T, parent: NodeType<T>) => {
		parent.left?.element === value ? (parent.left = null) : (parent.right = null);
	};

	const deleteNodeWithOneChild = (node: NodeType<T>, parent: NodeType<T>) => {
		const replacerNode = node.left !== null ? node.left : node.right;
		parent.left?.element === node.element ? (parent.left = replacerNode) : (parent.right = replacerNode);
	};

	const deleteNodeWithTwoChildren = (node: NodeType<T>, parent: NodeType<T>) => {
		// Already passing node.right to get successor ( inOrdersuccessor takes right node and than left node until leaf node)
		const { successor, successorParent } = inOrderSuccessor(node.right!, node);
		deleteLeafNode(successor.element, successorParent);
		if (node === parent) node.element = successor.element;
		else
			parent.left?.element === node.element
				? (parent.left.element = successor.element)
				: (parent.right!.element = successor.element);
	};

	const deleteNode = (value: T, node: NodeType<T> | null = root, parent: NodeType<T> = root): boolean => {
		if (value === root.element && numberOfNodesInTree() === 1) throw new Error("Root deletion not allowed.");
		if (node === null) return false;

		if (node.element === value) {
			if (isLeaf(node)) deleteLeafNode(value, parent);
			else if (hasTwoChildren(node)) deleteNodeWithTwoChildren(node, parent);
			else deleteNodeWithOneChild(node, parent);
			return true;
		}
		if (compareFn!(value, node.element) === -1) return deleteNode(value, node.left, node);
		else if (compareFn!(value, node.element) === 1) return deleteNode(value, node.right, node);
		return false;
	};

	const visit = (node: NodeType<T> | null = root, order: OrderType = "Inorder", values: T[] = []): T[] => {
		if (node === null) return [];
		const leftChildVisitResult = visit(node.left, order, values);
		const rightChildVisitResult = visit(node.right, order, values);
		switch (order) {
			case "Inorder":
				return [...leftChildVisitResult, node.element, ...rightChildVisitResult];
			case "Preorder":
				return [node.element, ...leftChildVisitResult, ...rightChildVisitResult];
			case "Postorder":
				return [...leftChildVisitResult, ...rightChildVisitResult, node.element];
			default:
				const _exhaustiveCheck: never = order;
				throw new Error("Unknown order.");
		}
	};

	const numberOfNodesInTree = (node: NodeType<T> = root) => {
		return visit(node).length;
	};

	const recursiveMap = ([currentElement, ...rest]: T[], fn: MapFnType<T>, index: number = 0) => {
		if (!currentElement) return [];

		return [fn(currentElement, index), ...recursiveMap(rest, fn, index + 1)];
	};

	const recursiveFilter = ([currentElement, ...rest]: T[], fn: FilterFnType<T>, index: number = 0) => {
		if (!currentElement) return [];
		const fnResult = fn(currentElement, index) ? [currentElement] : [];
		return [...fnResult, ...recursiveFilter(rest, fn, index + 1)];
	};

	const recursiveReduce = (
		array: T[],
		fn: ReduceFnType<T>,
		acc?: ReturnType<typeof fn>,
		index: number = 0
	): ReturnType<typeof fn> => {
		if (array.length === 0) return acc;

		if (!acc) [acc, ...array] = array;
		return fn(acc, recursiveReduce(array, fn, acc, index + 1), index + 1);
	};

	const map = (mapFn: MapFnType<T>, order: OrderType = "Inorder"): ReturnType<typeof mapFn>[] => {
		const elements = visit(root, order);
		return recursiveMap(elements, mapFn);
	};

	const filter = (filterFn: FilterFnType<T>, order: OrderType = "Inorder"): T[] => {
		const elements = visit(root, order);
		return recursiveFilter(elements, filterFn);
	};

	const forEach = (fn: ForEachFnType<T>, order: OrderType = "Inorder"): void => {
		const elements = visit(root, order);
		for (let [index, element] of elements.entries()) fn(element, index);
	};

	const reduce = (fn: ReduceFnType<T>, acc = undefined, order: OrderType = "Inorder"): ReturnType<typeof fn> => {
		const elements = visit(root, order);
		return recursiveReduce(elements, fn, acc);
	};

	const searchNode = (value: T, node: NodeType<T> = root): boolean => {
		if (node.element === value) return true;
		else {
			if (compareFn!(value, node.element) === -1 && node.left !== null) return searchNode(value, node.left);
			else if (compareFn!(value, node.element) === 1 && node.right !== null) return searchNode(value, node.right);
			return false;
		}
	};

	const add = (element: T) => addNode(element);
	const search = (element: T) => searchNode(element);
	const remove = (element: T) => deleteNode(element);
	const traverse = (order: OrderType) => visit(root, order);

	return { root, add, traverse, search, remove, map, filter, forEach, reduce };
};

export { binaryTree };

// const tree = binaryTree(6);
// tree.add(5);
// tree.add(1);
// tree.add(4);
// tree.add(7);
// tree.add(3);
// tree.add(8);

// console.log(tree.search(21));
// console.log(tree.traverse());
// console.log(tree.filter(el => el % 2 === 0, "Inorder"));

// const tree2 = binaryTree("oi");
// tree2.add("aaa");
// console.log(tree2.traverse());

// type person = {
// 	age: number;
// 	name: string;
// };

// const p1: person = { age: 20, name: "Johhhn" };
// const p2: person = { age: 25, name: "Doe" };

// const tree3 = binaryTree(p1, (n1: person, n2: person) => (n1.age > n2.age ? 1 : 0));
// tree3.add(p2);
// console.log(tree3.traverse());

// const traverse = (): T[] => {
// 	if (empty) return [];
// 	cosnt values = [];
// 	const visit = node => {
// 		if (node.left !== null) return visit(node.left);
// 		values = [...values, fn(node.element)];
// 		if (node.right !== null) return visit(node.right);
// 	};
// 	visit();
// 	return values;
// };

// TODO
// Implement depth and height functionalities

// ------------------------------ Testing ------------------------------
// const assertEquals = <T>(expected: T, actual: T): void => {
// 	let expectedValue: T | string = expected instanceof Array ? expected.sort() : expected;
// 	let actualValue: T | string = actual instanceof Array ? actual.sort() : actual;

// 	if (expectedValue instanceof Object) expectedValue = JSON.stringify(expectedValue);
// 	if (actualValue instanceof Object) actualValue = JSON.stringify(actualValue);

// 	if (expectedValue !== actualValue)
// 		throw new Error(`Test failed: >>>>>>>>>> Expected ${expectedValue}, but got ${actualValue} instead <<<<<<<<<<`);
// };

// const traverse = () => {
// 	tree.addNode(15);
// 	tree.addNode(3);
// 	tree.addNode(7);
// 	tree.addNode(11);
// 	tree.addNode(17);
// 	tree.addNode(19);
// 	return tree.traverse();
// };

// const addNode1 = () => {
// 	const tree = binaryTree<number>(10);
// 	tree.addNode(7);
// 	return tree.traverse();
// };

// const addNode2 = () => {
// 	const tree = binaryTree<number>(10);
// 	tree.addNode(7);
// 	tree.addNode(2);
// 	return tree.traverse();
// };

// const searchExistingValue = () => {
// 	const tree = binaryTree(10);
// 	tree.addNode(7);
// 	return tree.search(7);
// };

// const searchNonExistingValue = () => {
// 	const tree = binaryTree(10);
// 	tree.addNode(7);
// 	return tree.search(2);
// };

// const deleteLeftLeafNode = () => {
// 	const tree = binaryTree(10);
// 	tree.addNode(7);
// 	tree.addNode(11);
// 	tree.deleteNode(7);
// 	return tree.traverse();
// };

// const deleteRightLeafNode = () => {
// 	const tree = binaryTree(10);
// 	tree.addNode(7);
// 	tree.addNode(15);
// 	tree.deleteNode(15);
// 	return tree.traverse();
// };

// const deleteLeftOneChildNode = () => {
// 	const tree = binaryTree(10);
// 	tree.addNode(7);
// 	tree.addNode(3);
// 	tree.addNode(11);
// 	tree.deleteNode(7);
// 	return tree.traverse();
// };

// const deleteRightOneChildNode = () => {
// 	const tree = binaryTree(10);
// 	tree.addNode(7);
// 	tree.addNode(15);
// 	tree.addNode(17);
// 	tree.deleteNode(15);
// 	return tree.traverse();
// };

// const deleteLeftTwoChildrenNode = () => {
// 	const tree = binaryTree(10);
// 	tree.addNode(7);
// 	tree.addNode(3);
// 	tree.addNode(9);
// 	tree.addNode(11);
// 	tree.deleteNode(7);
// 	return tree.traverse();
// };

// const deleteRightTwoChildrenNode = () => {
// 	const tree = binaryTree(10);
// 	tree.addNode(7);
// 	tree.addNode(15);
// 	tree.addNode(19);
// 	tree.addNode(14);
// 	tree.deleteNode(15);
// 	return tree.traverse();
// };

// const deleteRoot = () => {
// 	const tree = binaryTree(10);
// 	tree.deleteNode(10);
// 	return tree.traverse();
// };

// const deleteRoot2 = () => {
// 	const tree = binaryTree(10);
// 	tree.addNode(7);
// 	tree.addNode(15);
// 	tree.addNode(19);
// 	tree.addNode(14);
// 	tree.deleteNode(10);
// 	return tree.traverse();
// };

// console.log("Testing...");
// assertEquals("3,5,7,10,11,15,17,19", traverse().toString());
// assertEquals("7,10", addNode1().toString());
// assertEquals("2,7,10", addNode2().toString());
// assertEquals("true", searchExistingValue().toString());
// assertEquals("false", searchNonExistingValue().toString());
// assertEquals("10,11", deleteLeftLeafNode().toString());
// assertEquals("7,10", deleteRightLeafNode().toString());
// assertEquals("3,10,11", deleteLeftOneChildNode().toString());
// assertEquals("7,10,17", deleteRightOneChildNode().toString());
// assertEquals("3,9,10,11", deleteLeftTwoChildrenNode().toString());
// assertEquals("7,10,14,19", deleteRightTwoChildrenNode().toString());
// assertEquals("", deleteRoot().toString());
// assertEquals("7,14,15,19", deleteRoot2().toString());
