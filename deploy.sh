#!/bin/bash
# Uso in Cloud Shell: curl -sL https://raw.githubusercontent.com/giuseppedema94-code/po-relay/main/deploy.sh | k=<chiave> bash
set -e
gcloud config set project comparaofferte
rm -rf ~/po-relay && git clone -q https://github.com/giuseppedema94-code/po-relay ~/po-relay && cd ~/po-relay
gcloud services enable run.googleapis.com cloudbuild.googleapis.com cloudfunctions.googleapis.com artifactregistry.googleapis.com
gcloud functions deploy po --gen2 --runtime=nodejs20 --region=europe-west8 --source=. --entry-point=po --trigger-http --allow-unauthenticated --memory=256Mi --max-instances=1 --set-env-vars=RELAY_KEY="$k" --quiet
U=$(gcloud functions describe po --gen2 --region=europe-west8 --format='value(serviceConfig.uri)')
echo "URL: $U"
curl -s -o /dev/null -w "TEST %{http_code} %{size_download}\n" -H "x-relay-key: $k" "$U?p=/portaleOfferte/it/open-data.page"
