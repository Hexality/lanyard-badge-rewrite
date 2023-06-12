import Head from "next/head";
import styled, { createGlobalStyle } from "styled-components";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

import { Badges } from "../public/assets/badges/BadgesEncoded";
import { getFlags } from "../src/getFlags";
import * as LanyardTypes from "../src/LanyardTypes";
import { encodeBase64 } from "../src/toBase64";
import { blue, green, gray, gold, red } from "../src/defaultAvatars";

import CloseIcon from '../public/assets/close.svg';
import MinimizeIcon from '../public/assets/minimize.svg';

export default function Home(body: LanyardTypes.Root) {
    const [userId, setUserId] = useState<null | string>(null);
    const [userError, setUserError] = useState<string>();
    /* const [copyState, setCopyState] = useState("Copy"); */
    /* const countRef = useRef<HTMLDivElement | null>(null); */

    console.log()
    useEffect(() => {
        (async () => {
            try {
                setUserId('422274807732633604')
                await axios.get(`/api/${userId}`);
                setUserError(undefined);
            } catch (error: any) {
                console.log(error.response);
                if (error.response.status === 404 && error.response.data.code == "user_not_monitored")
                    setUserError(`User not monitored, join https://discord.gg/lanyard`);
            }
        })();
    }, [userId]);

    return (
        <>
            <GlobalStyle />
            <Head>
                <link rel="preconnect" href="https://fonts.gstatic.com" />
                <title>Hexality</title>
                <meta property="og:title" content="Lanyard" key="title" />
                <meta
                    name="description"
                    content="Hexality"
                />
                <meta
                    name="og:description"
                    content="Hexality"
                />
            </Head>
            <Main>
                <Body>
                    <Header>
                        <FakeControls>
                            <ControlButton>
                                <MinimizeIcon/>
                            </ControlButton>
                            <ControlButton>
                                <CloseIcon/>
                            </ControlButton>
                        </FakeControls>
                    </Header>
                    <Page>
                        <Sidebar>
                            <Button>
                                <PlaceHolder></PlaceHolder>
                            </Button>
                            <Button>
                                <PlaceHolder></PlaceHolder>
                            </Button>
                            <Button>
                                <PlaceHolder></PlaceHolder>
                            </Button>
                            <Button>
                                <PlaceHolder></PlaceHolder>
                            </Button>
                            <Button>
                                <PlaceHolder></PlaceHolder>
                            </Button>
                            <Button>
                                <PlaceHolder></PlaceHolder>
                            </Button>
                            <Button>
                                <PlaceHolder></PlaceHolder>
                            </Button>
                            <Button>
                                <PlaceHolder></PlaceHolder>
                            </Button>
                        </Sidebar>
                        <Content>
                            Corno
                        </Content>
                    </Page>
                </Body>
            </Main>
        </>
    );
}

const GlobalStyle = createGlobalStyle`
    *, *::before, *::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-family: 'Segoe UI Variable Text', sans-serif;
    }

    ::-webkit-scrollbar {
        width: 10px;
    }

    ::-webkit-scrollbar-thumb {
        background: rgb(64 68 78);
        border-radius: 8px;
    }

    ::-webkit-scrollbar-track {
        background: rgb(24 28 39);
    }
`;

const Main = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 0;
    margin: 0;
    background: url('https://i.imgur.com/k8g0YPh.jpg');
    background-size: cover;
    box-sizing: border-box;
    `;

const Video = styled.video`
    /* display: none;*/
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
`

const Body = styled.div`
    display: flex; 
    flex-direction: column; 
    position: absolute; 
    border-radius: 8px; 
    top: 8px; 
    left: 8px; 
    right: 8px; 
    bottom: 8px; 
    margin: 0; 
    background-color: rgba(32, 32, 32, 0.8 ); 
    backdrop-filter: blur(240px); 
    -webkit-backdrop-filter: blur(240px);
    font-family: 'Segoe UI Variable Text', Montserrat, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
    font-size: 16px; 
    color: #fff; 
    overflow: hidden;
    box-shadow: 0 0 8px rgba(0,0,0, 0.55);
`;



const Header = styled.div`
    height: 50px;
    margin: 0;
`;

const Page = styled.div`
    display: flex;
    flex-direction: row;
    height: 100%;
`;

const Sidebar = styled.div`
    display: flex;
    position: relative;
    flex-direction: column;
    width: 50px;
    gap: 4px;
    left: 0
    top: 0;
    bottom: 0;
    padding: 0 4px;
`;

const FakeControls = styled.div`
    display: flex;
    flex: 0;
    flex-direction: row;
    justify-content: right;
    position: absolute;
    right: 0;
`;

const ControlButton = styled.div`
    width: 42px;
    height: 30px;
    display: grid;
    place-items: center;
    transition: background .15s ease-out;

    &:hover:not(:last-child) {
        background-color: rgba(255,255,255,.0605);
        transition: background .15s ease-in;
    }

    &:hover:last-child {
        background-color: rgba(194,45,27,1);
        transition: background .15s ease-in
    }

    &>svg {
        width: 10px;
    }
`

const Button = styled.div`
    display: grid;
    max-height: 36px;
    border-radius: 4px;
    place-items: center;
    padding: 8px 12px;
    background-color: rgba(255,255,255,.0605);

    &:first-child {
        padding: 8px 12px;
    }
`;

const Content = styled.div`
    display: grid;
    place-items: center;
    position: relative;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    height: 100%;
    width: 100%;
    background: rgba(58,58,58,.30);
    border-top-left-radius: 8px;
`;

const PlaceHolder = styled.div`width: 16px; height: 16px; background: rgba(0,0,0,.75)`