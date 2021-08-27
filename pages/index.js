import MeetupList from "../components/meetups/MeetupList";
import { MongoClient } from "mongodb";
import Head from "next/head";
import { Fragment } from "react";

function HomePage(props) {
  return (
    <Fragment>
      <Head>
        <title>Meetings Planner</title>
        <meta name="description" content="Store and manage your personal meetings centrally" />
      </Head>
      <MeetupList meetups={props.meetups} />
    </Fragment>
  );
}

export async function getStaticProps() {
  const client = await MongoClient.connect(
    "mongodb+srv://<username>:<password>@cluster0.pqdli.mongodb.net/meetings?retryWrites=true&w=majority"
  );
  const db = client.db();

  const meetupsCollection = db.collection("meetups");

  // .find() findet by default alle einträge in der jeweiligen collection
  const meetups = await meetupsCollection.find().toArray();

  client.close();

  return {
    props: {
      meetups: meetups.map((meetup) => ({
        title: meetup.title,
        address: meetup.address,
        image: meetup.image,
        // das hier ist die id, die von mongodb automatisch erstellt wird und die man konvertieren muss noch
        id: meetup._id.toString(),
        // description braucht man hier nicht, weil das nicht ausgegeben wird auf dieser Seite
      })),
    },
    revalidate: 1,
  };
}

export default HomePage;
