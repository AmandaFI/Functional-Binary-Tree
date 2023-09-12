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

// https://www.freecodecamp.org/news/binary-search-tree-traversal-inorder-preorder-post-order-for-bst/
// assertion typescript ? --> console.assertion ou criar própria fn: https://stackoverflow.com/questions/15313418/what-is-assert-in-javascript

type NodeType<T extends {}> = {
	element: T;
	left: NodeType<T> | null;
	right: NodeType<T> | null;
};

type CompareFnReturnType = -1 | 0 | 1;
type CompareFnType<T extends {}> = (el1: T, el2: T) => CompareFnReturnType;

type OrderType = "Inorder" | "Preorder" | "Postorder";

type MapFnType<T> = (element: T, index?: number) => any;
type FilterFnType<T> = (element: T, index?: number) => boolean;
type ForEachFnType<T> = (element: T, index?: number) => void;
type NodeForEachFnType<T extends {}> = (node: NodeType<T>, index?: number) => void;
type ReduceFnType<T> = (acc: any, element: T, index?: number) => any;

// {} allows all types except undefined and null
const binaryTree = <T extends {}>(rootElement: T, compareFn?: CompareFnType<T>) => {
	if ((typeof rootElement === "object" && !compareFn) || typeof rootElement === "function")
		throw new Error("Unable to sort tree.");

	const createNode = (element: T): NodeType<T> => {
		return { element, left: null, right: null };
	};

	compareFn ??= (firstValue, secondValue) => (firstValue === secondValue ? 0 : firstValue > secondValue ? 1 : -1);
	const root: NodeType<T> = createNode(rootElement);

	const isLeaf = (node: NodeType<T>) => [node.left, node.right].every(node => node === null);

	const hasTwoChildren = (node: NodeType<T>) => ![node.left, node.right].every(node => node === null);

	const hasOnlyOneChild = (node: NodeType<T>) =>
		(node.left !== null && node.right === null) || (node.left === null && node.right !== null);

	const nodeHeight = (rootNode: NodeType<T> | null = root, height = 0): number => {
		if (rootNode === null) return height;
		const leftHeight = nodeHeight(rootNode.left, height + 1);
		const rightHeight = nodeHeight(rootNode.right, height + 1);
		return Math.max(leftHeight, rightHeight);
	};

	const parent = (node: NodeType<T>, parentNode: NodeType<T> = root, rootNode = root): NodeType<T> | false => {
		const comparison = compareFn!(node.element, rootNode.element);
		if (comparison === 0) return parentNode; // root's parent is root
		else if (comparison === -1 && rootNode.left !== null) return parent(node, rootNode, rootNode.left);
		else if (comparison === 1 && rootNode.right !== null) return parent(node, rootNode, rootNode.right);
		return false; // never happens if used inside tree only
	};

	const validate = (rootNode: NodeType<T> | null = root): boolean => {
		if (rootNode === null) return true;
		if (rootNode.left && rootNode.left.element >= rootNode.element) return false;
		else if (rootNode.right && rootNode.right.element <= rootNode.element) return false;
		return true && validate(rootNode.left) && validate(rootNode.right);
	};

	const addNode = (element: T, node: NodeType<T> = root) => {
		if (element === node.element) return;
		if (compareFn!(element, node.element) === -1)
			node.left !== null ? addNode(element, node.left) : (node.left = createNode(element));
		else if (compareFn!(element, node.element) === 1)
			node.right !== null ? addNode(element, node.right) : (node.right = createNode(element));
	};

	const inOrderSuccessor = (node: NodeType<T>): NodeType<T> | false => {
		const ancestralSuccessor = (node: NodeType<T>): NodeType<T> | false => {
			const nodeParent = parent(node);
			if (nodeParent === root) return root;
			if (nodeParent && nodeParent.left === node) return nodeParent;
			else if (nodeParent) return ancestralSuccessor(nodeParent);
			return false;
		};
		const descendantSucessor = (node: NodeType<T>): NodeType<T> => {
			if (node.right === null && node.left === null) return node;
			return node.left !== null ? descendantSucessor(node.left) : node;
		};

		if (node.right && node.right.element === max()) return false;
		else if (node.right) return descendantSucessor(node.right);
		else return ancestralSuccessor(node);
	};

	const deleteLeafNode = (value: T, parent: NodeType<T>) => {
		parent.left?.element === value ? (parent.left = null) : (parent.right = null);
	};

	const deleteNodeWithOneChild = (node: NodeType<T>, parent: NodeType<T>) => {
		const replacerNode = node.left !== null ? node.left : node.right;
		parent.left?.element === node.element ? (parent.left = replacerNode) : (parent.right = replacerNode);
	};

	const deleteNodeWithTwoChildren = (node: NodeType<T>, parent: NodeType<T>) => {
		const successor = inOrderSuccessor(node);
		if (!successor) deleteLeafNode(node.element, parent);
		else {
			deleteNode(node.element);
			parent.left?.element === node.element
				? (parent.left.element = successor.element)
				: (parent.right!.element = successor.element);
		}
	};

	const deleteNode = (value: T, node: NodeType<T> | null = root, parent: NodeType<T> = root): boolean => {
		if (value === root.element && numberOfNodes() === 1) throw new Error("Root deletion not allowed.");
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

	const visit = (node: NodeType<T> | null = root, order: OrderType = "Inorder", values: T[] = []): NodeType<T>[] => {
		if (node === null) return [];
		const leftChildVisitResult = visit(node.left, order, values);
		const rightChildVisitResult = visit(node.right, order, values);
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

	// BUG
	const recursiveReduce = (array: NodeType<T>[], fn: ReduceFnType<T>, acc: any = undefined, index = 0): ReturnType<typeof fn> => {
		if (array.length === 0) return acc;
		if (acc === undefined) [acc.element, ...array] = array;
		return fn(acc, recursiveReduce(array.slice(1), fn, acc, index + 1), index + 1);
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

	const numberOfNodes = (node: NodeType<T> = root) => {
		return visit(node).length;
	};

	const numberOfLeafNodes = (node: NodeType<T> = root): number => {
		let leafNodesCount = 0;
		nodeForEach(node => {
			if (isLeaf(node)) leafNodesCount += 1;
		});
		return leafNodesCount;
	};

	const numberOfOnlyOneChildNodes = (node: NodeType<T> = root) => {
		let onlyOneChildNodesCount = 0;
		nodeForEach(node => {
			if (hasOnlyOneChild(node)) onlyOneChildNodesCount += 1;
		});
		return onlyOneChildNodesCount;
	};

	const numberOfTwoChildrenNodes = (node: NodeType<T> = root) => {
		let twoChildrenNodesCount = 0;
		nodeForEach(node => {
			if (hasTwoChildren(node)) twoChildrenNodesCount += 1;
		});
		return twoChildrenNodesCount;
	};

	const searchNode = (value: T, node: NodeType<T> = root): NodeType<T> | false => {
		const comparison = compareFn!(value, node.element);
		if (comparison === 0) return node;
		else if (comparison === -1 && node.left !== null) return searchNode(value, node.left);
		else if (comparison === 1 && node.right !== null) return searchNode(value, node.right);
		return false;
	};

	const min = (node: NodeType<T> = root): T =>
		reduce((acc, element) => (compareFn!(element, acc) === -1 ? element : acc), root, node);

	const max = (node: NodeType<T> = root): T =>
		reduce((acc, element) => (compareFn!(element, acc) === 1 ? element : acc), root, node);

	const traverse = (rootNode: NodeType<T> = root, order: OrderType = "Inorder") => map(element => element, rootNode, order);

	const add = (element: T) => addNode(element);
	const remove = (element: T) => deleteNode(element);
	const search = (element: T) => (searchNode(element) ? true : false);
	const height = (rootNode: NodeType<T> = root) => nodeHeight(rootNode);

	return { root, add, traverse, search, remove, map, filter, forEach, reduce, min, max, inOrderSuccessor, validate, height };
};

export { binaryTree };

const tree = binaryTree(6);
tree.add(2);
tree.add(9);
tree.add(1);
tree.add(4);
tree.add(8);
tree.add(7);
tree.add(13);
tree.add(11);
tree.add(12);
tree.add(18);
// console.log(tree.validate(tree.root.right!));
console.log(tree.traverse());
console.log(`Root height: ${tree.height(tree.root)}`);
console.log(`Left tree height: ${tree.height(tree.root.left!.left!)}`);
console.log(`Right tree height: ${tree.height(tree.root.right!)}`);

console.log(tree.map(element => element ** 2));
console.log(tree.filter(element => element % 2 === 0));
console.log(tree.reduce((acc, el) => (el % 2 === 0 ? acc + 1 : acc), 0));

console.log(tree.max());
console.log(tree.min());

// console.log(tree.search(21));
// console.log(tree.inOrderSuccessor(tree.root.right!));
// tree.display();
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
