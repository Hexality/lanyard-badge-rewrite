import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import renderCard from "../../src/renderCard";
import { isSnowflake } from "../../src/snowflake";

type Data = {
    id?: string | string[];
    error?: any;
    code?: string;
};

type Parameters = {
    theme?: string;
    bg?: string;
    hideStatus?: boolean;
    hideTimestamp?: boolean;
    hideDiscrim?: boolean;
    borderRadius?: number;
    animated?: boolean;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    let getUser;

    const params: Parameters = req.query,
        userGet = req.query?.id;
    if (req.query?.id !== undefined) {
        const userId = userGet ? userGet?.toString() : "";
        if (!isSnowflake(userId))
            return res.send({
                error: `That is not a valid snowflake ID!`,
            });

        try {
            getUser = await axios(`https://api.lanyard.rest/v1/users/${userId}`);
        } catch (error: any) {
            if (error.response.data && error.response.data.error.message)
                return res
                    .status(404)
                    .send({ error: error.response.data.error.message, code: error.response.data.error.code });

            if (error.response.status === 404) return res.status(404).send({ error: "Invalid user!" });

            console.log(error); // Only console log the error if its not a 404

            return res.status(400).send({
                error: `Something went wrong! If everything looks correct and this still occurs, please contact @notcnrad on Twitter.`,
            });
        }

        res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
        res.setHeader("content-security-policy", "default-src 'none'; img-src * data:; style-src 'unsafe-inline'");

        const svg = await renderCard(getUser.data, params);
        res.status(200).send(svg as any);
    }
}
