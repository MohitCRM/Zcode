const mongoose = require('mongoose');
const {Schema} = mongoose;

const problemSchema = new Schema({
    name : {
        type : String,
        required : true,
    },
    description : {
        type : String,
        required : true
    },
    difficulty : {
        type : String,
        enum : ['easy','medium','hard'],
        required : true
    },
    tags : {
        type : String,
        required : true,
        enum : leetcodeTags
    },
    visibleTestCases : [
        {
            input : {
                type :String,
                required : true
            },
            output : {
                type : String,
                required : true,
            },
            explaination :{
                type : String ,
                requried : true 
            }
        }
    ],
    hiddenTestCases : [
        {
            input : {
                type :String,
                required : true
            },
            output : {
                type : String,
                required : true,
            },
            explaination :{
                type : String ,
                requried : true 
            }
        }
    ],

    startcode : [
        {
            language : {
                type : String,
                required : true
            },
            initialcode : {
                type : String,
                required : true
            }
        }
    ],

    problemcreator : {
        type : Schema.Types.ObjectId,
        ref : 'user', //This is the ref of user schema for the above line (user is name of that schema)
        required : true
    }

},
{
    timestamps: true
})


const leetcodeTags = [
  // --- Core Data Structures ---
  "Array", "String", "Hash Table", "Linked List", "Tree", "Binary Tree", 
  "Binary Search Tree", "Graph", "Matrix", "Stack", "Queue", "Heap (Priority Queue)", 
  "Trie", "Monotonic Stack", "Monotonic Queue",

  // --- Core Algorithms & Techniques ---
  "Two Pointers", "Sliding Window", "Binary Search", "Sorting", "Prefix Sum", 
  "Recursion", "Backtracking", "Divide and Conquer", "Greedy", "Bit Manipulation",

  // --- Graph / Tree Traversals ---
  "Depth-First Search", "Breadth-First Search", "Union Find", "Topological Sort", 
  "Shortest Path", "Minimum Spanning Tree", "Eulerian Circuit", 
  "Biconnected Component", "Strongly Connected Component",

  // --- Dynamic Programming & Advanced Math ---
  "Dynamic Programming", "Memoization", "Math", "Bitmask", "Combinatorics", 
  "Probability and Statistics", "Geometry", "Number Theory", "Game Theory",

  // --- Specialized Data Structures ---
  "Segment Tree", "Binary Indexed Tree", "Line Sweep", "Ordered Set", 
  "Data Stream", "String Matching", "Rolling Hash", "Suffix Array",

  // --- System Design & Miscellaneous ---
  "Design", "Database", "Database (SQL)", "Shell", "Concurrency", 
  "Brainteaser", "Simulation", "Counting", "Radix Sort", "Bucket Sort", 
  "Merge Sort", "Quickselect", "Interactive"
];

const Problem = mongoose.model('problem', problemSchema);
module.exports = Problem;