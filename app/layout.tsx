import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Wonder Woman · The Eight-Round Challenge',description:'Eight questions, a quick break, and one final task.',robots:{index:false,follow:false},icons:{icon:'/favicon.svg'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
