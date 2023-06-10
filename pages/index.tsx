import Head from "next/head";
import styled, { createGlobalStyle } from "styled-components";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function Home({ userCount }: { userCount: number }) {
    const [userId, setUserId] = useState<null | string>(null);
    const [userError, setUserError] = useState<string>();
    const [copyState, setCopyState] = useState("Copy");
    
    const countRef = useRef<HTMLDivElement | null>(null);

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
                <link
                    href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,200;1,300;1,400&display=swap"
                    rel="stylesheet"
                />
                <title>Lanyard for GitHub Profile</title>
                <meta property="og:title" content="Lanyard" key="title" />
                <meta
                    name="description"
                    content="Lanyard internals: Hexality"
                />
                <meta
                    name="og:description"
                    content="Lanyard internals: Hexality"
                />
            </Head>
            <Main>
                <Container>
                    {userId ? (
                        <>
                            <Example
                                src={`/api/${userId}`}
                                style={{ color: "#ff8787" }}
                            >
                            </Example>
                        </>
                    ) : null}
                </Container>
            </Main>
            <FooterStat>
                <Redirect >
                    <MyLogo onClick={() => console.log('a')} src="https://hexality.github.io/src/content/images/logo.svg"/>
                </Redirect>
            </FooterStat>
        </>
    );
}

export async function getServerSideProps(ctx: any) {
    let userCount = await axios
        .get("https://lanyard.cnrad.dev/api/getUserCount", { timeout: 1000 })
        .then(res => res.data.count)
        .catch(() => 1000);

    return {
        props: { userCount },
    };
}

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: 'Poppins', sans-serif;
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
    
    const Container = styled.div`
    backdrop-filter: blur(240px);
    padding: 16px;
    border-radius: 16px;
    box-shadow: 0 0 16px 1px rgba(0,0,0,.5)
    border: 4px solid #c9a14f;
`;

const Example = styled.img`
    display: block;
    max-width: 100%;
`;

const FooterStat = styled.div`
    position: fixed;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    top: 8px;
    left: 8px;
    padding: 4px;
    border-radius: 50%;
    text-align: center;
    transition: background .15s ease-out;
    opacity: .5;
`;

const Redirect = styled.a`
`

const MyLogo = styled.img`
    width: 56px;
    height: 56px;
    backdrop-filter: blur(240px);
`;