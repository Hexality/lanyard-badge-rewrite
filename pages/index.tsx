import Head from "next/head";
import styled, { createGlobalStyle } from "styled-components";

export default function Home() {
    return (
        <>
            <Head>
                <title>Garbage</title>
            </Head>
            <B className="body">
                <GlobalStyle/>
                <H className="navHeader"></H>
                <C className="content">
                    
                    <C className="card">
                        <div id="garbage">
                            <h1>Garbage under construction</h1>
                        </div>
                        <C className="profile">
                            <C id="avatar" className="container">
                                <A id="avatar" className="image"/>
                            </C>
                            <L className="lineOne">
                                <C className="name"></C>
                                <C className="username"></C>
                                <C className="badges"></C>
                            </L>
                            <L className="lineTwo">
                                <C className="status">
                                    <C id="status" className="emoji"></C>
                                    <C id="status" className="text"></C>
                                </C>
                            </L>
                        </C>
                        <C id="presence" className="game"></C>
                        <C id="presence" className="spotify"></C>
                    </C>
                </C>
            </B>
        </>
    )
}

const GlobalStyle = createGlobalStyle`
    h1 {
        color: #fff;
        font-size: 50px;
        font-family: system-ui, sans-serif;
    }

    #garbage {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: grid;
        place-items: center;
    }
`
const B = styled.div``
const L = styled.div``
const A = styled.div``
const C = styled.div``
const H = styled.div``