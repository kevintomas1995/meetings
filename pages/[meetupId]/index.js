import MeetupDetail from "../../components/meetups/MeetupDetail";
import { MongoClient, ObjectId } from "mongodb";
import { Fragment } from "react";
import Head from "next/head";

function MeetupDetails(props) {
  return (
    <Fragment>
      <Head>
        <title>{props.meetupData.title}</title>
        <meta
          name="description"
          content={props.meetupData.description}
        />
      </Head>
      <MeetupDetail
        image={props.meetupData.image}
        title={props.meetupData.title}
        address={props.meetupData.address}
        description={props.meetupData.description}
      />
    </Fragment>
  );
}

// das braucht man, um die Seiten mit dynamischen Links prerendern zu können
// hier zählt man dann alle Möglichkeiten auf
export async function getStaticPaths() {
  const client = await MongoClient.connect(
    "mongodb+srv://kevin:XkWJANgOTkACuIMGTzIIokbszqAo@cluster0.pqdli.mongodb.net/meetings?retryWrites=true&w=majority"
  );
  const db = client.db();

  const meetupsCollection = db.collection("meetups");

  // bei find in der ersten {}: das sind Filter
  // das zweite argument gibt an, welche Felder (title, image usw) gefunden werden sollen
  // und hier dann nur die _id-Felder
  const meetups = await meetupsCollection.find({}, { _id: 1 }).toArray();

  client.close();

  return {
    // wenn eine Id eingebeben wird, die nicht existiert, dann kommt keine 404 Page
    fallback: 'blocking',

    // hier gibt man dynamisch alle Routen an
    paths: meetups.map((meetup) => ({
      params: {
        meetupId: meetup._id.toString(),
      },
    })),
  };
}

export async function getStaticProps(context) {
  const meetupId = context.params.meetupId;

  const client = await MongoClient.connect(
    "mongodb+srv://kevin:XkWJANgOTkACuIMGTzIIokbszqAo@cluster0.pqdli.mongodb.net/meetings?retryWrites=true&w=majority"
  );
  const db = client.db();

  const meetupsCollection = db.collection("meetups");

  // hier wollen wir nur eins finden, das wir auch noch filtern
  // man wrappt die meetupId mit dem ObjectID, weil das ja bei mongodb sone komische ID ist und kein String
  const selectedMeetup = await meetupsCollection.findOne({
    _id: ObjectId(meetupId),
  });

  client.close();

  return {
    props: {
      meetupData: {
        id: selectedMeetup._id.toString(),
        title: selectedMeetup.title,
        address: selectedMeetup.address,
        image: selectedMeetup.image,
        description: selectedMeetup.description,
      },
    },
    revalidate: 1,
  };
}

export default MeetupDetails;
