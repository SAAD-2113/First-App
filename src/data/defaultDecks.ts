import { Deck } from '../types';

export const DEFAULT_DECKS: Deck[] = [
  {
    id: 'flutter-basics',
    title: 'Flutter Basics',
    description: 'Learn the fundamentals of Flutter widgets, state management, and lifecycle.',
    iconName: 'Smartphone',
    color: 'from-red-600 to-yellow-500',
    cards: [
      {
        id: 'fb-1',
        question: 'What is the difference between a StatelessWidget and a StatefulWidget in Flutter?',
        answer: 'A StatelessWidget is immutable and cannot change its state during runtime. A StatefulWidget is mutable and can rebuild its user interface dynamically when state changes via setState().',
        isMastered: false
      },
      {
        id: 'fb-2',
        question: 'What is the purpose of the pubspec.yaml file?',
        answer: 'It is the configuration file of a Flutter project. It defines project dependencies (packages, SDK versions), asset paths (images, fonts), and general metadata.',
        isMastered: false
      },
      {
        id: 'fb-3',
        question: 'Explain the purpose of key in Flutter widgets.',
        answer: 'Keys are used to uniquely identify widgets and preserve their state when they move around in the element tree, especially when elements are added, deleted, or reordered.',
        isMastered: false
      },
      {
        id: 'fb-4',
        question: 'What is the difference between hot reload and hot restart?',
        answer: 'Hot reload compiles newly changed source code and injects it into the Dart VM, preserving the current application state. Hot restart resets the state and rebuilds the widget tree from scratch, which takes slightly longer.',
        isMastered: false
      },
      {
        id: 'fb-5',
        question: 'What are the main methods of a State object\'s lifecycle?',
        answer: 'The primary lifecycle methods are: createState(), initState(), didChangeDependencies(), build(), didUpdateWidget(), deactivate(), and dispose().',
        isMastered: false
      }
    ]
  },
  {
    id: 'web-development',
    title: 'React & Web Tech',
    description: 'Core concepts of modern web development, React, and browser mechanics.',
    iconName: 'Globe',
    color: 'from-red-700 to-amber-500',
    cards: [
      {
        id: 'wd-1',
        question: 'What is the Virtual DOM in React?',
        answer: 'A lightweight, in-memory representation of the real DOM. React uses it to calculate differences (diffing) and batch updates to the real DOM for high-performance UI rendering.',
        isMastered: false
      },
      {
        id: 'wd-2',
        question: 'What is a Closure in JavaScript?',
        answer: 'A closure is the combination of a function bundled together with references to its surrounding state (the lexical environment). It allows an inner function to access variables of its outer function even after that outer function has returned.',
        isMastered: false
      },
      {
        id: 'wd-3',
        question: 'What does the useEffect hook do in React?',
        answer: 'It lets functional components perform side effects such as data fetching, subscriptions, or manual DOM manipulations. It runs after rendering and can clean up resources via a returned function.',
        isMastered: false
      },
      {
        id: 'wd-4',
        question: 'What is the difference between localStorage and sessionStorage?',
        answer: 'localStorage persists data across browser sessions indefinitely until cleared. sessionStorage only keeps data active for the duration of the page session (until the tab/browser is closed).',
        isMastered: false
      }
    ]
  },
  {
    id: 'space-trivia',
    title: 'Space Exploration',
    description: 'Fun questions about our solar system, planets, and space flight.',
    iconName: 'Orbit',
    color: 'from-red-500 to-yellow-400',
    cards: [
      {
        id: 'st-1',
        question: 'Which planet in our solar system has the most moons?',
        answer: 'Saturn holds the record with over 140 confirmed moons, overtaking Jupiter which has 95 confirmed moons.',
        isMastered: false
      },
      {
        id: 'st-2',
        question: 'What is the boundary surrounding a black hole from which nothing can escape?',
        answer: 'The Event Horizon. Beyond this boundary, the gravitational pull is so strong that even light does not travel fast enough to escape.',
        isMastered: false
      },
      {
        id: 'st-3',
        question: 'What was the first artificial satellite launched into orbit, and by whom?',
        answer: 'Sputnik 1, launched by the Soviet Union on October 4, 1957. This event triggered the Space Race.',
        isMastered: false
      }
    ]
  }
];
