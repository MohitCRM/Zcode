const mongoose = require('mongoose');
const { Schema } = mongoose;

const leetcodeTags = [
    "Array",
    "Backtracking",
    "Biconnected Component",
    "Binary Indexed Tree",
    "Binary Search",
    "Binary Search Tree",
    "Binary Tree",
    "Bit Manipulation",
    "Bitmask",
    "Brainteaser",
    "Breadth-First Search",
    "Bucket Sort",
    "Combinatorics",
    "Concurrency",
    "Counting",
    "Counting Sort",
    "Data Stream",
    "Database",
    "Depth-First Search",
    "Design",
    "Divide and Conquer",
    "Doubly-Linked List",
    "Dynamic Programming",
    "Enumeration",
    "Eulerian Circuit",
    "Game Theory",
    "Geometry",
    "Graph",
    "Greedy",
    "Hash Function",
    "Hash Table",
    "Heap (Priority Queue)",
    "Interactive",
    "Iterator",
    "Line Sweep",
    "Linked List",
    "Math",
    "Matrix",
    "Memoization",
    "Merge Sort",
    "Minimum Spanning Tree",
    "Monotonic Queue",
    "Monotonic Stack",
    "Number Theory",
    "Ordered Set",
    "Prefix Sum",
    "Probability and Statistics",
    "Queue",
    "Quickselect",
    "Radix Sort",
    "Randomized",
    "Recursion",
    "Rejection Sampling",
    "Reservoir Sampling",
    "Rolling Hash",
    "Segment Tree",
    "Shell",
    "Shortest Path",
    "Simulation",
    "Sliding Window",
    "Sorting",
    "Stack",
    "String",
    "String Matching",
    "Strongly Connected Component",
    "Suffix Array",
    "Topological Sort",
    "Tree",
    "Trie",
    "Two Pointers",
    "Union Find"
];

const problemSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },
    tags: [{
        type: String,
        enum: leetcodeTags,
        required: true
    }],

    baseEloReward: {
        type: Number,
        required: true,
        default: 100 
    },
    penaltyWrongAnswer: { type: Number, default: 10 },
    penaltyTimeLimitExceeded: { type: Number, default: 10 },
    penaltyRuntimeError: { type: Number, default: 10 },
    penaltyCompilationError: { type: Number, default: 0 }, 

    seasonId: {
        type: Number,
        required: true,
        index: true 
    },
    round: {
        type: Number,
        enum: [1, 2],
        required: true,
        index: true
    },
    releaseDay: {
        type: Number,
        required: true, 
        min: 1,
        max: 25,
        index: true
    },

    drivercode:{
        type: String,
        required : true,
        default : ""
    },
    constraints: {
    timeLimit: { 
        type: Number, 
        required: true, 
        default: 1.0 
    },
    memoryLimit: { 
        type: Number, 
        required: true, 
        default: 256 
    },
    inputConstraints: {
        type: String, 
        default: "2 <= nums.length <= 10^4, -10^9 <= nums[i] <= 10^9"
    }
},
    
    visibleTestCases: [
        {
            input: { type: String, required: true },
            output: { type: String, required: true },
            explanation: { type: String } 
        }
    ],
    hiddenTestCases: [
        {
            input: { type: String, required: true },
            output: { type: String, required: true }
        }
    ],

    startcode: [
        {
            language: { type: String, required: true },
            initialcode: { type: String, required: true }
        }
    ],
    referencesolution: [
        {
            language: { type: String, required: true },
            code: { type: String, required: true } 
        }
    ],
    problemcreator: {
        type: Schema.Types.ObjectId,
        ref: 'user', 
        required: true
    }
}, {
    timestamps: true
});

problemSchema.index({ seasonId: 1, round: 1, releaseDay: 1 });

const Problem = mongoose.model('problem', problemSchema);
module.exports = Problem;