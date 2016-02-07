module.exports = function(grunt) {

  	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		
		// Load npm tasks

        bower_concat: {
            all: {
                dest: 'app/vendor/js/_bower.js',
                cssDest: 'app/vendor/css/_bower.css',
                bowerOptions: {
                    relative: false
                }
            }
        },
		
		watch: {
            files: 'app/**/*.{html,css,js,json}',
        },

		browserSync: {
            dev: {
                bsFiles: {
                    src : [
                        'app/**/*.{css,html,js,json}'
                    ]
                },
                options: {
                    watchTask: true,
                    server: 'app'
                }
            }
        }

	});
    grunt.loadNpmTasks('grunt-bower-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-browser-sync');
		
	// define default task
    grunt.registerTask('default', ['browserSync', 'watch']);


};