#!groovy

node('AspComponents') {
    try {
        deleteDir();
       
         stage('Import') {
            git url: 'https://gitea.syncfusion.com/essential-studio/ej2-groovy-scripts.git', branch: 'master', credentialsId: env.GiteaCredentialID;
            shared = load 'src/shared.groovy';
        }

        stage('Checkout') {
            checkout scm;
        }

	stage('Workflow Validation') {
            shared.getProjectDetails();
            shared.gitlabCommitStatus('running');
            shared.validateMRDescription();
        }
	
	if(shared.checkCommitMessage()) {
            stage('Install') {
                shared.showcaseInstall();
            }
            stage('Build-NET8') {
                shared.runShell('gulp aspCore-showcase-build --option ./core/jsonandxml-to-diagram-visualizer/JsonAndXmlToDiagramVisualizer.csproj');
            }
			
	    stage('Publish') {
                if(shared.isProtectedBranch()) {
                    shared.runShell('gulp azure-core-publish');
		}
            }
        }
	shared.gitlabCommitStatus('success');
        deleteDir();
    }
    catch(Exception e) {
        shared.throwError(e);
    }
}
