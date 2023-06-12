//probably the messiest code i've ever written but it works so :)

import { Badges } from "../public/assets/badges/BadgesEncoded";
import { getFlags } from "./getFlags";
import * as LanyardTypes from "./LanyardTypes";
import { encodeBase64 } from "./toBase64";
import { blue, green, gray, gold, red } from "./defaultAvatars";
import escape from "escape-html";

type Parameters = {
    theme?: string;
    bg?: string;
    animated?: boolean;
    hideDiscrim?: boolean;
    hideStatus?: boolean;
    hidePresence?: boolean;
    hideTwitch?: boolean;
    hideTimestamp?: boolean;
    hideBadges?: boolean;
    hideProfile?: boolean;
    borderRadius?: number;
    idleBox?: boolean;
};

const elapsedTime = (timestamp: any) => {
    let startTime = timestamp;
    let endTime = Number(new Date());
    let difference = (endTime - startTime) / 1000;

    // we only calculate them, but we don't display them.
    // this fixes a bug in the Discord API that does not send the correct timestamp to presence.
    let daysDifference = Math.floor(difference / 60 / 60 / 24);
    difference -= daysDifference * 60 * 60 * 24;

    let hoursDifference = Math.floor(difference / 60 / 60);
    difference -= hoursDifference * 60 * 60;

    let minutesDifference = Math.floor(difference / 60);
    difference -= minutesDifference * 60;

    let secondsDifference = Math.floor(difference);

    return `${hoursDifference >= 1 ? ("0" + hoursDifference).slice(-2) + ":" : ""}${("0" + minutesDifference).slice(
        -2
    )}:${("0" + secondsDifference).slice(-2)}`;
};

function getInHours(millis: number) {
    const initialSeconds = millis / 1000;
    const hours = Math.floor(initialSeconds / 3600);
    const minutes = Math.floor((initialSeconds - (hours * 3600)) / 60);
    const seconds = Math.floor(initialSeconds - (minutes * 60) - (hours * 3600));
    return [hours, minutes, seconds];
}

function formatHours(timeArr: number[]) {
    const formatter = Intl.NumberFormat('pt-BR', {
        minimumIntegerDigits: 2,
    });
    return timeArr.map((num, index) => 
        index === 0 && num === 0 ?
        null :
        formatter.format(num)
    )
        .filter(Boolean)
        .join(':');
}

function getSpotifyTimeData(data?: LanyardTypes.Spotify) {
    if(!data) return null
    const now = Date.now();
    const { start, end } = data.timestamps;
    const max = end - start;
    const current = now - start;
    const percentual = Math.round(current >= max ? 100 : (current * 100) / max)
    return {
        percentual,
        max: formatHours(getInHours(max)),
        current: formatHours(getInHours(current)),
    }
}

function generateUriStartsWith<T extends { [K: string]: string; }>(obj: T, defaultValue?: string) {
    return {
        check(value: string): T[keyof T] {
            for(const key of Object.keys(obj)) {
                if(value.startsWith(key))
                    return obj[key] as any
            }
            return defaultValue as any
        }
    }
}

const renderCard = async (body: LanyardTypes.Root, params: Parameters): Promise<string> => {
    let { data } = body;

    function switchParams<T>(
        params: T,
    ): { [K in keyof T]: boolean } {
        return Object.fromEntries(
            Object.entries(params as any).map(([key, value]) => [
            key,
            value !== undefined && value !== null && value !== 'false',
            ]),
        ) as any;
    }

    const { 
        hideStatus, 
        hideTimestamp, 
        hideBadges,
        hideProfile,
        hideDiscrim,
        hidePresence,
        hideTwitch
    } = switchParams(params);

    let avatarBorderColor: string = "#747F8D",
        avatarExtension: string = "webp",
        statusExtension: string = "webp",
        backgroundColor: string = "1a1c1f",
        theme = "dark",
        borderRadius = 8,
        idleBox = false;

    if (data.activities[0]?.emoji?.animated) statusExtension = "gif";
    if (data.discord_user.avatar && data.discord_user.avatar.startsWith("a_")) avatarExtension = "gif";
    if (params.animated) avatarExtension = "webp";
    if (params.theme === "light") {
        backgroundColor = "#eee";
        theme = "light";
    }
    if (params.bg) backgroundColor = params.bg;
    if (params.idleBox) idleBox = params.idleBox;
    if (params.borderRadius) borderRadius = params.borderRadius;

    let avatar: String;
    if (data.discord_user.avatar) {
        avatar = await encodeBase64(
            `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${
                data.discord_user.avatar
            }.${avatarExtension}?size=${avatarExtension === "gif" ? "64" : "256"}`
        );
    } else {
        let lastDigit = Number(data.discord_user.discriminator.substr(-1));
        if (lastDigit >= 5) {
            lastDigit -= 5;
        }
        // the default avatar that discord uses depends on the last digit of the user's discriminator

        avatar = {
            1: gray,
            2: green,
            3: gold,
            4: red
        }[lastDigit] ?? blue
    }

    let flags: string[] = getFlags(data.discord_user.public_flags);
    if (data.discord_user.avatar && data.discord_user.avatar.includes("a_")) flags.push("Nitro");

    let userStatus: Record<string, any> | null = null;
    if (data.activities[0] && data.activities[0].type === 4) userStatus = data.activities[0];

    const customStatus = data.activities.filter((u) => u.type === 4)
    const emojiStatusUrl = await encodeBase64(customStatus.map(i => i.emoji ? `https://cdn.discordapp.com/emojis/${i.emoji?.id}.${i.emoji?.animated ? 'gif' : 'png'}` : '').toString())
    const emojiFormat = customStatus.map((i) => i.emoji?.animated ? 'gif' : 'png')
    const emojiStatus = `data:image/${emojiFormat};base64,${emojiStatusUrl}`

    // Filter only type 0
    const activities = data.activities.filter(activity => activity.type === 0);

    const twitch = data.activities.filter(twi => twi.type === 1);

    const twictivity =  Array.isArray(twitch) ? twitch[0] : twitch;

    // Take the highest one
    const activity = Array.isArray(activities) ? activities[0] : activities;

    !!!twictivity ? (
        avatarBorderColor = {
            'online': '#43B581',
            'idle': '#FAA61A',
            'dnd': '#F04747'
        }[data.discord_status] ?? '#747F8D'
    ) : avatarBorderColor = '#593695'

    const spotifyData: LanyardTypes.Spotify = data?.spotify;
    const spotifyTimeData = getSpotifyTimeData(spotifyData)
    
    const activityCount = 
        (!!activity || !!twictivity ? 1 : 0) +
        (!!spotifyData ? 1 : 0);

    // 246 -> 110
    // 168 -> 32
    // (hideProfile ? 32 : 110) + (activityCount * 136) + (activityGapCount * 6)
    const profileSize = (hideProfile ? 32 : 104)
    const presenceSize = (!hidePresence ? (activityCount * ((136 + 6))): 0)
    const svgSize = profileSize + presenceSize;

    const profileComponent = `
        <div style="display: flex; width: auto; background: rgb(255,255,255,0.0512); min-height: 72px; border-radius: 8px; inset: 0; flex-direction: row; overflow: hidden;">
            <div title="avatar-box" style="display: grid; place-items: center;aspect-ratio: 1;width: 72px;min-width: 72px;">
                <div style=" height: 52px; aspect-ratio: 1; background: url('data:image/png;base64,${avatar}') no-repeat; background-size: cover; box-shadow: 0 0 0 2px ${avatarBorderColor}; border-radius: 4px;"></div>
            </div>
            <div title="header-box" style="width: 100%; padding: 4px 8px 7px 8px; display: flex; align-self: center; flex-direction: column; gap: 2px;">
                <div title="row-1" style="display: flex; flex-direction: row; gap: 6px;">
                    <p style="font-family: 'Segoe UI Variable Display', Montserrat, sans-serif; font-weight: 600; font-size: 16px; margin: 0; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;">
                        ${(data.discord_user.discriminator === '0') ? escape(data.discord_user.display_name) : escape(data.discord_user.username) }
                    </p>
                    ${ !!!hideDiscrim ? `<div title="username-box" style="display: grid; border: 1px solid rgba(255,255,255, 0.0698); border-top: 1px solid rgba(255,255,255,0.0903); background: rgba(255,255,255,0.0605); font-family: 'Segoe UI Variable Small', Montserrat, sans-serif; font-size: 10px; align-items: center; padding: 2px 4px; border-radius: 2px; place-items: center;">
                        <p style="margin: 0;">
                            ${!(data.discord_user.discriminator === '0') ? "#"+data.discord_user.discriminator : "@"+data.discord_user.username}
                        </p>
                    </div>`: ""
                    }
                    ${
                        (!!!hideBadges ? flags.map(v => `
                        <div title="badges" style="display: flex; flex-direction: row; gap: 4px;">
                            <div title="badge" style="display: grid; place-items: center; width: 16px; height: 16px; padding: 2px; border-radius: 2px; border: 1px solid rgba(255,255,255, 0.0698); border-top: 1px solid rgba(255,255,255,0.0903); background: rgba(255,255,255,0.0605);">
                                <div style="background: url('data:image/png;base64,${Badges[v]}') no-repeat; background-size: contain; background-position: center; height: 16px; aspect-ratio: 1;"></div>
                            </div>
                        </div>`) : []).join('')
                    }
                </div>
                ${
                    !!!hideStatus ? (!!!(customStatus.length === 0) ? `
                <div title="row-2" style="display: flex; flex-direction: row; align-items: center; gap: 4px;">
                    ${emojiStatusUrl ? `<img style="height: 14px; border-radius: 2px;" src="${emojiStatus}"/>` : ''}
                    <p style="font-family: 'Segoe UI Variable Text', Montserrat, sans-serif; text-align: center; font-size: 12px; color: rgba(255,255,255,0.5); margin: 0; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;">
                        ${customStatus.map(i => i.state ? escape(i.state) : '')}
                    </p>
                </div>
                ` : '') : ''}
            </div>
        </div>
    `

    let presenceTitle: string;
    presenceTitle = {
        'code': 'Coding stuff',
        'aimp': 'Listening to APIM',
    }[escape(activity?.name?.toLowerCase?.())] ?? 'Playing a game';

    const getPresenceImage = (asset: string) => {
        return generateUriStartsWith({
            'twitch:':`https://static-cdn.jtvnw.net/previews-ttv/live_user_${asset.replace?.("twitch:", "")}-864x480.jpg`,
            'mp:icons/':`https://media.discordapp.net/icons/${asset?.replace?.("mp:icons/", "")}`,
            'mp:external/':`https://media.discordapp.net/external/${asset?.replace?.("mp:external/", "")}`,
            'mp:attachments/':`https://media.discordapp.net/attachments/${asset?.replace?.("mp:attachments", "")}`
        },
            `https://cdn.discordapp.com/app-assets/${(!!twictivity ? twictivity : activity)?.application_id}/${asset}.webp`
        ).check(asset)
    }

    const presenceComponent = activity ? `
    <div style="
        display: flex; 
        position: relative; 
        background: rgb(255,255,255,0.0512); 
        border-radius: 8px; 
        flex-direction: row; 
        padding: 8px; 
        height: 100%;
        width: auto; 
        top: 0; 
        bottom: 0;">
        <div title="presence" style="
            display: flex; 
            flex-direction: column;">
            <p style="
                margin: 0; 
                font-weight: 600; 
                font-size: 14px; 
                font-family: 'Segoe UI Variable Display', Montserrat, sans-serif; 
                margin-left: 8px; 
                margin-top: 4px;">
                ${!!presenceTitle ? presenceTitle : ''}
            </p>
            <div title="presenceData" style="
                display: flex; 
                flex-direction: row;
                margin-top: 1px;
                margin-left: 8px;"> 
                <div title="largeImageKey" style="
                    background-image: url('data:image/png;base64,${ 
                        !!activity.assets?.large_image ? 
                            await encodeBase64(
                                getPresenceImage(activity.assets?.large_image)
                            )
                            : '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'
                        }'); 
                        display: flex; 
                        background-size: cover; 
                        aspect-ratio: 1; 
                        width: 72px; 
                        height: 72px; 
                        margin: 8px 8px; 
                        border-radius: 8px; 
                        justify-content:flex-end; 
                        align-items:flex-end">
                    ${ !!activity.assets?.small_image ? `<div title="smallImageText" style="
                        background-image: url('data:image/png;base64,${
                            await encodeBase64(
                                getPresenceImage(activity.assets?.small_image)
                            )
                            }'); 
                        background-size: contain; 
                        border-radius: 50%; 
                        width: 22px; 
                        height: 22px; 
                        aspect-ratio: 1; 
                        position: relative; 
                        box-shadow: 0 0 4px 0 rgba(0,0,0,.25);
                        right: -3px; 
                        bottom: -3px"/>` : '' }
                </div>
                <div title="presenceText" style="
                    display: flex; 
                    flex-direction: column; 
                    align-self: center; 
                    width: 280px; 
                    margin-top: -5px">
                    ${ !!activity.name ? `<div title="activityName" style="
                        font-family: 'Segoe UI Variable Text', Montserrat, sans-serif; 
                        font-size: 13px; 
                        font-weight: 600;">
                        <p style="
                            margin: 0;
                            overflow: hidden; 
                            display: -webkit-box; 
                            -webkit-line-clamp: 1; 
                            -webkit-box-orient: vertical;">
                            ${escape(activity.name)}</p>
                    </div>` : ''}
                    ${ !!activity.details ? `<div title="presenceDetails" style="
                        font-family: 'Segoe UI Variable Text', Montserrat, sans-serif; 
                        font-size: 12px; 
                        font-weight: 400 ;">
                        <p style="
                            margin: 0; 
                            overflow: hidden; 
                            display: -webkit-box; 
                            -webkit-line-clamp: 1; 
                            -webkit-box-orient: vertical;">
                            ${escape(!!activity.details ? activity.details : '' )}
                        </p>
                    </div>` : ''}
                    ${ !!activity.state ? `<div title="presenceState" style="
                        font-family: 'Segoe UI Variable Text', Montserrat, sans-serif; 
                        font-size: 12px; 
                        font-weight: 400 ;">
                        <p style="
                            margin: 0;
                            overflow: hidden; 
                            display: -webkit-box; 
                            -webkit-line-clamp: 1; 
                            -webkit-box-orient: vertical;">
                            ${
                                escape(!!activity.state ? activity.state : '' )}${
                                    !!(activity.party?.size) ? ` (${activity.party?.size[0]} of ${activity.party?.size[1]
                                })` : ''
                            }
                        </p>
                    </div>` : ''}
                    ${ !!activity.timestamps?.start ? 
                        `<div title="presenceTimeStamp" style="
                        font-family: 'Segoe UI Variable Text', Montserrat, sans-serif; 
                        font-size: 12px; 
                        font-weight: 400 ;">
                        <p style="
                            margin: 0;
                            overflow: hidden; 
                            display: -webkit-box; 
                            -webkit-line-clamp: 1; 
                            -webkit-box-orient: vertical;">
                            ${elapsedTime(new Date(activity.timestamps.start).getTime())} elapsed
                        </p>
                    </div>` : ''}
                </div>
            </div>
        </div>
    </div>
    ` : ''

    let twitchTitle: string;
    twitchTitle = {
        'twitch': 'Live on Twitch',
        'youtube': 'Live on YouTube',
    }[escape(twictivity?.name?.toLowerCase?.())] ?? 'Streaming';


    const twitchComponent = twictivity ? `
    <div style="
        display: flex; 
        position: relative; 
        background: rgb(255,255,255,0.0512); 
        border-radius: 8px; 
        flex-direction: row; 
        padding: 8px; 
        height: 100%;
        width: auto; 
        top: 0; 
        bottom: 0;">
        <div title="presence" style="
            display: flex; 
            flex-direction: column;">
            <p style="
                margin: 0; 
                font-weight: 600; 
                font-size: 14px; 
                font-family: 'Segoe UI Variable Display', Montserrat, sans-serif; 
                margin-left: 8px; 
                margin-top: 4px;">
                ${twitchTitle ? twitchTitle : ''}
            </p>
            <div title="presenceData" style="
                display: flex; 
                flex-direction: row;
                margin-top: 1px;
                margin-left: 8px;"> 
                <div title="largeImageKey" style="
                    background-image: url('data:image/png;base64,${ 
                        twictivity.assets?.large_image ? 
                            await encodeBase64(
                                getPresenceImage(twictivity.assets?.large_image)
                            )
                            : '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'
                        }'); 
                        display: flex; 
                        background-size: cover; 
                        background-position: center;
                        aspect-ratio: 1; 
                        width: 72px; 
                        height: 72px; 
                        margin: 8px 8px; 
                        border-radius: 8px; 
                        justify-content:flex-end; 
                        align-items:flex-end">
                    ${ twictivity.assets?.small_image ? `<div title="smallImageText" style="
                        background-image: url('data:image/png;base64,${
                            await encodeBase64(
                                getPresenceImage(twictivity.assets?.small_image)
                            )
                            }'); 
                        background-size: contain; 
                        border-radius: 50%; 
                        width: 22px; 
                        height: 22px; 
                        aspect-ratio: 1; 
                        position: relative; 
                        right: -3px; 
                        bottom: -3px"/>` : '' }
                </div>
                <div title="presenceText" style="
                    display: flex; 
                    flex-direction: column; 
                    align-self: center; 
                    width: 280px; 
                    margin-top: -5px">
                    ${twictivity.details ? `<div title="activityName" style="
                        font-family: 'Segoe UI Variable Text', Montserrat, sans-serif; 
                        font-size: 13px; 
                        font-weight: 600;">
                        <p style="
                            margin: 0;
                            overflow: hidden; 
                            display: -webkit-box; 
                            -webkit-line-clamp: 1; 
                            -webkit-box-orient: vertical;">
                            ${escape(twictivity.details)}</p>
                    </div>` : ''}
                    ${twictivity.state ? `<div title="presenceState" style="
                        font-family: 'Segoe UI Variable Text', Montserrat, sans-serif; 
                        font-size: 12px; 
                        font-weight: 400 ;">
                        <p style="
                            margin: 0;
                            overflow: hidden; 
                            display: -webkit-box; 
                            -webkit-line-clamp: 1; 
                            -webkit-box-orient: vertical;">
                            ${
                                escape(
                                    twictivity.state ? twictivity.state : '' )}${(twictivity.party?.size) ? ` (${twictivity.party?.size[0]} of ${twictivity.party?.size[1]})` : ''}
                        </p>
                    </div>` : ''}
                    ${twictivity.created_at ? `<div title="presenceTimeStamp" style="
                        font-family: 'Segoe UI Variable Text', Montserrat, sans-serif; 
                        font-size: 12px; 
                        font-weight: 400 ;">
                        <p style="
                            margin: 0;
                            overflow: hidden; 
                            display: -webkit-box; 
                            -webkit-line-clamp: 1; 
                            -webkit-box-orient: vertical;">
                            ${elapsedTime(new Date(twictivity.created_at).getTime())} elapsed
                        </p>
                    </div>` : ''}
                </div>
            </div>
        </div>
    </div>
    ` : ''

    // (spotifyPercentual / 100) * 280
    const spotifyComponent = spotifyData ? `
    <div style="
        display: flex; 
        flex-direction: row; 
        position: relative; 
        background: rgb(255,255,255,0.0512); 
        border-radius: 8px; 
        padding: 8px; 
        width: auto; 
        height: 100%;
        top: 0; 
        bottom: 0;">
        <div title="presence" style="
            display: flex; 
            flex-direction: column;">
            <p style="
                margin: 0; 
                font-weight: 600; 
                font-size: 14px; 
                font-family: 'Segoe UI Variable Display', Montserrat, sans-serif; 
                margin-top: 4px;
                margin-left: 8px;">Listening to Spotify</p>
            <div title="presenceData" style="
                display: flex; 
                flex-direction: row;
                margin-top: 1px; 
                margin-left: 8px;">
                <div title="largeImageKey" style="background-image: url('${
                    await ( async () => {
                        const albumArt = await encodeBase64(spotifyData.album_art_url);
                        if(albumArt) return `data:image/png;base64,${albumArt}`
                })()}'); 
                background-size: cover; 
                aspect-ratio: 1; 
                width: 72px; 
                height: 72px; 
                margin: 8px 8px; 
                border-radius: 8px;"/>
                <div title="presenceText" style="
                    display: flex; 
                    flex-direction: column; 
                    align-self: center; 
                    width: 280px; 
                    margin-top: -5px">
                    <div title="activityName" style="
                        font-family: 'Segoe UI Variable Text', Montserrat, sans-serif; 
                        font-size: 13px; 
                        font-weight: 600;">
                        <p style="margin: 0;">${!!spotifyData.song ? escape(spotifyData.song):''}</p>
                    </div>
                    <div title="presenceDetails" style="
                        font-family: 'Segoe UI Variable Text', Montserrat, sans-serif; 
                        font-size: 12px; 
                        font-weight: 400 ;">
                        <p style="margin: 0;">
                            by ${escape(spotifyData.artist)}
                            </p>
                            </div>
                            <div title="presenceState" style="
                                font-family: 'Segoe UI Variable Text', Montserrat, sans-serif; 
                                font-size: 12px; 
                                font-weight: 400 ;">
                            <p style="margin: 0;">
                            on ${escape(spotifyData.album)}
                        </p>
                    </div>
                    ${!!spotifyTimeData ? `
                    <div style="
                        display: flex; 
                        flex-direction: row; 
                        right: 12px;">
                        <p style="
                            margin: 0; 
                            font-size: 9px">${spotifyTimeData?.current}</p>
                        <p style="
                            margin: 0; 
                            font-size: 9px; 
                            position: absolute; 
                            right: 24px">${spotifyTimeData?.max}</p>
                    </div>
                    <div title="progress" style="
                        display: flex; 
                        overflow: hidden; 
                        height: 2px; 
                        background: rgba(255,255,255,0.06); 
                        border-radius: 2px">
                        <div title="progressStamp" style="
                            display: flex; 
                            background-color: #fff; 
                            height: 2px; 
                            width: ${(spotifyTimeData.percentual / 100) * 280}px; 
                            border-radius: 2px"/>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>
    </div>
    ` : ''

    return `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xhtml="http://www.w3.org/1999/xhtml" width="440" height="${svgSize}">
    <link xmlns="" type="text/css" rel="stylesheet" id="dark-mode-custom-link"/>
    <link xmlns="" type="text/css" rel="stylesheet" id="dark-mode-general-link"/>
    <style xmlns="" lang="en" type="text/css" id="dark-mode-custom-style"/>
    <style xmlns="" lang="en" type="text/css" id="dark-mode-native-style"/>
    <style xmlns="" lang="en" type="text/css" id="dark-mode-native-sheet"/>
    <foreignObject x="0" y="0" width="440" height="${svgSize}">
        <div xmlns="http://www.w3.org/1999/xhtml" style="
            display: flex; 
            flex-direction: column; 
            position: absolute; 
            border-radius: 8px; 
            top: 8px; 
            left: 8px; 
            right: 8px; 
            bottom: 8px; 
            margin: 0; 
            gap: 6px; 
            padding: 8px; 
            background-color: rgba(30, 30, 30, 0.8 ); 
            backdrop-filter: blur(240px); 
            -webkit-backdrop-filter: blur(240px);
            font-family: 'Segoe UI Variable Text', Montserrat, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
            font-size: 16px; 
            color: #fff; 
            box-shadow: 0 0 8px rgba(0,0,0, 0.55);">
            ${!!!hideProfile ? profileComponent : ''}
            ${!!!hidePresence ? (
                !!!hideTwitch ? (
                    !!twictivity 
                    ? twitchComponent 
                    : presenceComponent
                    ) : presenceComponent
                ) : ''
            }
            ${!!!hidePresence ? spotifyComponent : ''}
        </div>
    </foreignObject>
</svg>
        `;
};

export default renderCard;
