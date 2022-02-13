import { getTokenFromGCPServiceAccount } from '@sagi.io/workers-jwt'

const LATEST_PUZZLE_URL =
  'https://nyt-games-prd.appspot.com/svc/crosswords/v3/36569100/puzzles.json?publish_type=daily&sort_order=desc&sort_by=print_date&limit=2'
const LATEST_PUZZLE_DATA_BASE_URL =
  'https://www.nytimes.com/svc/crosswords/v2/puzzle/'

type PuzzleMetadata = {
  author: string
  editor: string
  format_type: string
  print_date: string
  publish_type: string
  puzzle_id: number
  title: string
  version: number
  percent_filled: number
  solved: boolean
  star: null
}

type FirestoreResult = {
  error?: {
    code: number
    message: string
  }
  documents: unknown[]
}

export async function handleRequest(): Promise<Response> {
  console.log('Starting XWordeScraper function')
  console.log('Loading latest puzzle metadata')

  const latestPuzzlesMetadataResponse = await fetch(LATEST_PUZZLE_URL)
  const latestPuzzlesMetadata = await latestPuzzlesMetadataResponse.json<{
    status: string
    results: PuzzleMetadata[]
  }>()

  if (latestPuzzlesMetadata.status != 'OK') {
    throw new Error(
      `Received bad response from metadata query. ${latestPuzzlesMetadata.status}`,
    )
  }
  const latestPuzzleMetadata = latestPuzzlesMetadata.results[0]

  const latestPuzzleID = latestPuzzleMetadata.puzzle_id
  const latestPuzzleTitle = latestPuzzleMetadata.title
  const latestPuzzleDate = new Date(
    Date.parse(`${latestPuzzleMetadata.print_date}`),
  )
  console.log('Latest Puzzle Metadata: ')
  console.log('NYT Puzzle ID: ', latestPuzzleID)
  console.log('Date: ', latestPuzzleDate)
  if (latestPuzzleTitle) {
    console.log('Title: ', latestPuzzleTitle)
  }

  const serviceAccount = {
    type: 'service_account',
    project_id: 'xword-b9f56',
    private_key_id: '20b0f20280821a384732326bd730e3f557c811a9',
    private_key: 'REDACTED',
    client_email: 'firestore-admin@xword-b9f56.iam.gserviceaccount.com',
    client_id: '113670857717485476200',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url:
      'https://www.googleapis.com/robot/v1/metadata/x509/firestore-admin%40xword-b9f56.iam.gserviceaccount.com',
  }

  const jwtToken = await getTokenFromGCPServiceAccount({
    serviceAccountJSON: serviceAccount,
    aud: serviceAccount.token_uri,
    payloadAdditions: {
      scope: [
        // scope required for firestore
        'https://www.googleapis.com/auth/datastore',
      ].join(' '),
    },
  })

  // console.log('JWT', jwtToken)

  const response = await (
    await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwtToken,
      }),
    })
  ).json<Record<string, unknown>>()

  const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${serviceAccount.project_id}/databases/(default)/documents/puzzles`
  const firestoreResult = await fetch(firestoreUrl, {
    headers: new Headers({ Authorization: `Bearer ${response.access_token}` }),
  })

  const firesoreResultObject = await firestoreResult.json<FirestoreResult>()
  console.log(
    firestoreUrl,
    firesoreResultObject.documents[0],
    firesoreResultObject.error,
  )

  return new Response(`Done!`)
}
