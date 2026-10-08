import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'For Wonder Woman · Just for you',description:'A few questions. A bit of magic. Made just for you.',robots:{index:false,follow:false},icons:{icon:'/favicon.svg'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
