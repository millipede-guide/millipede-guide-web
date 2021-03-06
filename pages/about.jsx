import Layout from '../components/Layout';
import { ContentBox, H1, P } from '../components/Typography';

export default function About() {
    return (
        <Layout title="About" href="/about/">
            <H1>About</H1>
            <ContentBox>
                <P>
                    This is a collaborative, open-source guide to the natural world including heritage listed areas, parks,
                    attractions, campsites and walking (or cycling) routes.
                </P>
                <P>
                    It aims to provide simple, timeless, factual information without prose, opinions or advice.
                </P>
                <P>
                    Photos in the guide aim to show as much information as possible and represent
                    average conditions. For example, if a walking route includes a spectacular view
                    but also very steep steps with heavy erosion, this guide will include a photo of
                    the steps.
                </P>
                <P>
                    Geotagged information is easily viewable on embedded maps as well as downloads
                    for GPS devices and links out to OSM, Google and Apple maps.
                </P>
                <P>
                    The app and content are open source and contributions are welcome. The project
                    is hosted on GitHub at{' '}
                    <a href={`https://github.com/${process.env.GITHUB_REPOSITORY}`}>
                        github.com/{process.env.GITHUB_REPOSITORY}
                    </a>
                    .
                </P>
                <P>
                    <small>
                        Please see:{' '}
                        <a href="/third-party-notices.txt">
                            third-party notices
                        </a>
                        .
                    </small>
                </P>
                <P>
                    <small>
                        Icon/logo image is by{' '}
                        <a href="https://www.needpix.com/photo/download/1278472/worm-centipedes-free-pictures-free-photos-free-images-royalty-free-free-illustrations">
                            charlygutmann (pixabay.com)
                        </a>
                    </small>
                </P>
            </ContentBox>
        </Layout>
    );
}
