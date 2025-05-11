# Hands-on Lab

## Setup

> Purpose: Get set up with the development environment

**Setup Steps:**

1. **Configure your environment**
   - Ensure you have Node.js and npm installed
   - Clone the repository if you haven't already

2. **Start the Next.js Application**
   ```bash
   # Install dependencies
   cd /path/to/presentation
   npm install
   
   # Start the development server
   npm run dev
   ```

3. **Open in browser**
   - Navigate to http://localhost:3000
   - You should see the presentation home page

## Exploring the Codebase

> Let's explore how the presentation is structured and learn how to make changes.

**Key Project Areas:**

1. **Slide Content**
   - Located in `/slides-md` directory
   - Markdown files with slide content
   - Numbered prefixes determine slide order

2. **Components**
   - Located in `/src/app/components`
   - Reusable UI elements like QR codes and timers
   - Can be embedded in slides

3. **Styling**
   - TailwindCSS for responsive design
   - Custom styles in `globals.css`
   - Typography styling with `@tailwindcss/typography`

## Hands-on Exercises

> Try these exercises to get familiar with the codebase

**Try These Exercises:**

1. Add a new slide to the presentation
2. Modify an existing slide's content
3. Add a QR code to one of your slides
4. Change styling of an element using Tailwind classes

## Advanced Topics

> For those who want to go further

1. Create a new interactive component
   ```jsx
   // Example component structure
   export default function MyComponent() {
     return (
       <div className="my-component">
         {/* Component content here */}
       </div>
     );
   }
   ```

2. Implement custom slide transitions
3. Add MermaidJS diagrams to your slides